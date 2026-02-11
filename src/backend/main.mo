import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  include MixinStorage();

  type Profile = {
    principal : Principal;
    role : AccessControl.UserRole;
    studentId : ?Text;
    name : Text;
    email : Text;
    bio : ?Text;
  };

  module Profile {
    public func compare(profile1 : Profile, profile2 : Profile) : Order.Order {
      switch (Text.compare(profile1.name, profile2.name)) {
        case (#equal) { Text.compare(profile1.email, profile2.email) };
        case (order) { order };
      }
    };
  };

  type AchievementCategory = {
    #project;
    #researchPaper;
    #hackathon;
    #certificate;
  };

  type Achievement = {
    achievementId : Text;
    studentId : Text;
    studentPrincipal : Principal;
    title : Text;
    category : AchievementCategory;
    description : Text;
    date : Time.Time;
    links : ?[Text];
    status : VerificationStatus;
    verificationHistory : [VerificationEvent];
    certificateImage : ?Storage.ExternalBlob;
  };

  type AchievementInput = {
    achievementId : Text;
    studentId : Text;
    studentPrincipal : Principal;
    title : Text;
    category : AchievementCategory;
    description : Text;
    date : Time.Time;
    links : ?[Text];
    certificateImage : ?Storage.ExternalBlob;
  };

  type VerificationStatus = {
    #pending;
    #verified;
    #rejected;
  };

  type VerificationEvent = {
    verifier : Principal;
    status : VerificationStatus;
    notes : ?Text;
    timestamp : Time.Time;
  };

  let profiles = Map.empty<Principal, Profile>();
  let achievements = Map.empty<Text, Achievement>();

  // Helper function to check if caller is a verifier (Admin only in this system)
  func isVerifier(caller : Principal) : Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  // Helper function to check if achievement belongs to caller
  func isAchievementOwner(caller : Principal, achievement : Achievement) : Bool {
    achievement.studentPrincipal == caller;
  };

  // Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?Profile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    profiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?Profile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    profiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : Profile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    profiles.add(caller, profile);
  };

  public query ({ caller }) func getAllProfiles() : async [Profile] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view all profiles");
    };
    profiles.values().toArray().sort();
  };

  // Achievements Management
  public shared ({ caller }) func createAchievement(achievementInput : AchievementInput) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create achievements");
    };

    // Verify that the caller is creating an achievement for themselves
    if (achievementInput.studentPrincipal != caller) {
      Runtime.trap("Unauthorized: Can only create achievements for yourself");
    };

    // Verify that the studentId matches the caller's profile
    switch (profiles.get(caller)) {
      case (?profile) {
        switch (profile.studentId) {
          case (?sid) {
            if (sid != achievementInput.studentId) {
              Runtime.trap("Invalid: Student ID does not match your profile");
            };
          };
          case (null) {
            Runtime.trap("Invalid: You must have a Student ID in your profile to create achievements");
          };
        };
      };
      case (null) {
        Runtime.trap("Invalid: Profile not found");
      };
    };

    if (achievements.containsKey(achievementInput.achievementId)) {
      Runtime.trap("Achievement with the given ID already exists");
    };

    let newAchievement : Achievement = {
      achievementId = achievementInput.achievementId;
      studentId = achievementInput.studentId;
      studentPrincipal = achievementInput.studentPrincipal;
      title = achievementInput.title;
      category = achievementInput.category;
      description = achievementInput.description;
      date = achievementInput.date;
      links = achievementInput.links;
      status = #pending;
      verificationHistory = [];
      certificateImage = achievementInput.certificateImage;
    };

    achievements.add(achievementInput.achievementId, newAchievement);
  };

  public query ({ caller }) func getAchievement(achievementId : Text) : async Achievement {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view achievements");
    };

    let achievement = switch (achievements.get(achievementId)) {
      case (?achievement) { achievement };
      case (null) { Runtime.trap("Achievement not found") };
    };

    // Allow viewing if: owner, verifier, or achievement is verified
    if (not (isAchievementOwner(caller, achievement) or isVerifier(caller) or achievement.status == #verified)) {
      Runtime.trap("Unauthorized: Can only view your own unverified achievements or verified achievements");
    };

    achievement;
  };

  public query ({ caller }) func getAchievementsByStudentId(studentId : Text) : async [Achievement] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can search achievements");
    };

    let allAchievements = achievements.values().toArray().filter(func(a) { a.studentId == studentId });

    // Filter based on permissions
    if (isVerifier(caller)) {
      // Verifiers can see all achievements
      allAchievements;
    } else {
      // Regular users can only see verified achievements or their own
      allAchievements.filter(func(a) {
        a.status == #verified or isAchievementOwner(caller, a)
      });
    };
  };

  public query ({ caller }) func getVerifiedAchievementsByCategory(category : AchievementCategory) : async [Achievement] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can search achievements");
    };
    achievements.values().toArray().filter(func(a) { a.category == category and a.status == #verified });
  };

  public query ({ caller }) func searchAchievements(searchTerm : Text) : async [Achievement] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can search achievements");
    };

    let matchingAchievements = achievements.values().toArray().filter(func(a) {
      a.title.contains(#text searchTerm) or a.description.contains(#text searchTerm)
    });

    // Filter based on permissions
    if (isVerifier(caller)) {
      // Verifiers can see all matching achievements
      matchingAchievements;
    } else {
      // Regular users can only see verified achievements or their own
      matchingAchievements.filter(func(a) {
        a.status == #verified or isAchievementOwner(caller, a)
      });
    };
  };

  // Verification Workflow
  public shared ({ caller }) func verifyAchievement(achievementId : Text, status : VerificationStatus, notes : ?Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can verify achievements");
    };

    let achievement = switch (achievements.get(achievementId)) {
      case (?achievement) { achievement };
      case (null) { Runtime.trap("Achievement not found") };
    };

    // Cannot verify your own achievements
    if (isAchievementOwner(caller, achievement)) {
      Runtime.trap("Unauthorized: Cannot verify your own achievements");
    };

    let verificationEvent : VerificationEvent = {
      verifier = caller;
      status;
      notes;
      timestamp = Time.now();
    };

    let updatedAchievement : Achievement = {
      achievement with
      status;
      verificationHistory = achievement.verificationHistory.concat([verificationEvent]);
    };

    achievements.add(achievementId, updatedAchievement);
  };

  public query ({ caller }) func getAchievementsForVerification() : async [Achievement] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view achievements for verification");
    };

    achievements.values().toArray().filter(func(a) { a.status == #pending });
  };
};
