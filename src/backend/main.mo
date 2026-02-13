import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

import Nat64 "mo:core/Nat64";
import List "mo:core/List";
import Debug "mo:core/Debug";

import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import OutCall "http-outcalls/outcall";

actor {
  type GeminiApiKey = { unredacted : Text };
  let geminiApiKey = ?{ unredacted = "{IC_SECRETS_GEMINI_API_KEY}" : Text };

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
      };
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

  // Geminis Chatbot Overview
  type GeminiChatRequest = {
    context : Text;
    message : Text;
  };

  type GeminiChatResponse = {
    prompt : Text;
    answer : Text;
  };

  public shared ({ caller }) func chatWithGemini(chatRequest : GeminiChatRequest) : async GeminiChatResponse {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can chat with Gemini");
    };

    switch (geminiApiKey) {
      case (null) { Runtime.trap("Gemini API key not configured properly; check your deployment secrets (.env) ") };
      case (?api) {
        let prompt = buildPrompt(chatRequest.context, chatRequest.message);
        let responseText = await callGeminiApi(prompt);
        {
          prompt;
          answer = responseText;
        };
      };
    };
  };

  func buildPrompt(context : Text, message : Text) : Text {
    "Context: " # context # " User Message: " # message;
  };

  type GeminiModel = {
    #geminiPro;
    #geminiUltra;
    #codeGen;
    #textEmbedding;
    #textToImage;
    #videoGeneration;
  };

  type GeminiApiError = {
    #invalidApiKey;
    #rateLimited;
    #requestTimeout;
    #unexpectedResponse;
    #networkError;
    #unknownError;
    #notFound;
    #invalidModel;
  };

  func getModelName(modelId : GeminiModel) : Text {
    switch (modelId) {
      case (#geminiPro) { "models/gemini-1.0-pro-latest" };
      case (#geminiUltra) { "models/gemini-1.0-ultra-latest" };
      case (#codeGen) { "models/gemini-1.0-pro-001" };
      case (#textEmbedding) { "models/embedding-001" };
      case (#textToImage) { "models/gemini-1.0-pro-001" };
      case (#videoGeneration) { "models/gemini-1.0-pro-001" };
    };
  };

  // Gemini API Client
  func callGeminiApi(prompt : Text) : async Text {
    let apiKey = switch (geminiApiKey) {
      case (null) { Runtime.trap("Invalid Gemini API key configuration; check your deployment secrets (.env)") };
      case (?apiKey) { apiKey.unredacted };
    };

    let url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro-latest:generateContent";
    let requestBody = createRequestBody(prompt);
    let apiResponse = await postRequest(url, apiKey, requestBody);
    switch (parseResponse(apiResponse)) {
      case (#ok(result)) { result };
      case (#unexpectedResponse) {
        Runtime.trap("Gemini returned unexpected response: " # url # apiKey # requestBody # apiResponse # apiKey);
      };
      case (#rateLimited) { Runtime.trap("Gemini rate limiting. Try again later.") };
      case (#invalidApiKey) { Runtime.trap("Invalid Gemini API key") };
      case (#notFound) { Runtime.trap("Endpoint not found") };
      case (#requestTimeout) { Runtime.trap("Gemini request timeout ") };
      case (#networkError) { Runtime.trap("Gemini network error") };
      case (#unknownError) { Runtime.trap("Gemini unknown error ") };
      case (#invalidModel) { Runtime.trap("Invalid Gemini model for prompt ") };
    };
  };

  func createRequestBody(prompt : Text) : Text {
    "{
      \"contents\": [{
        \"parts\": [{
          \"text\": \"" # prompt # "\"
        }]
      }]
    }";
  };

  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  func postRequest(url : Text, apiKey : Text, body : Text) : async Text {
    let requestUrl = url # "?key=" # apiKey;
    let responseText = await OutCall.httpPostRequest(
      requestUrl,
      [ { name = "Content-Type"; value = "application/json" } ],
      body,
      transform,
    );
    Debug.print("[Gemini] Response from Gemini: " # responseText);
    responseText;
  };

  type GeminiApiErrorCode = {
    #invalidApiKey;
    #rateLimited;
    #requestTimeout;
    #unexpectedResponse;
    #networkError;
    #unknownError;
    #notFound;
    #invalidPrompt;
    #invalidModel;
  };

  func parseResponse(responseText : Text) : {
    #ok : Text;
    #unexpectedResponse;
    #rateLimited;
    #invalidApiKey;
    #notFound;
    #requestTimeout;
    #networkError;
    #unknownError;
    #invalidModel;
  } {
    if (responseText.contains(#text "Rate limit")) {
      #rateLimited;
    } else if (responseText == "{\"error\":{\"code\":401,\"message\":\"API key not valid. Please pass a valid API key.\",\"status\":\"UNAUTHENTICATED\"}}\n") {
      #invalidApiKey;
    } else if (responseText.contains(#text "Not Found")) {
      #notFound;
    } else if (responseText.contains(#text "timeout")) {
      #requestTimeout;
    } else if (responseText == "" or responseText.contains(#text "errorMessage") or responseText.contains(#text "Invalid argument") or responseText.contains(#text "internal") or responseText.contains(#text "Invalid") or responseText.contains(#text "Error")) {
      #unexpectedResponse;
    } else if (responseText.contains(#text "model not found")) {
      #invalidModel;
    } else {
      #ok(responseText);
    };
  };
};
