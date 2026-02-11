import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Achievement {
    status: VerificationStatus;
    title: string;
    certificateImage?: ExternalBlob;
    achievementId: string;
    studentId: string;
    verificationHistory: Array<VerificationEvent>;
    date: Time;
    studentPrincipal: Principal;
    description: string;
    links?: Array<string>;
    category: AchievementCategory;
}
export type Time = bigint;
export interface AchievementInput {
    title: string;
    certificateImage?: ExternalBlob;
    achievementId: string;
    studentId: string;
    date: Time;
    studentPrincipal: Principal;
    description: string;
    links?: Array<string>;
    category: AchievementCategory;
}
export interface VerificationEvent {
    status: VerificationStatus;
    verifier: Principal;
    notes?: string;
    timestamp: Time;
}
export interface Profile {
    bio?: string;
    principal: Principal;
    studentId?: string;
    name: string;
    role: UserRole;
    email: string;
}
export enum AchievementCategory {
    certificate = "certificate",
    researchPaper = "researchPaper",
    hackathon = "hackathon",
    project = "project"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum VerificationStatus {
    verified = "verified",
    pending = "pending",
    rejected = "rejected"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createAchievement(achievementInput: AchievementInput): Promise<void>;
    getAchievement(achievementId: string): Promise<Achievement>;
    getAchievementsByStudentId(studentId: string): Promise<Array<Achievement>>;
    getAchievementsForVerification(): Promise<Array<Achievement>>;
    getAllProfiles(): Promise<Array<Profile>>;
    getCallerUserProfile(): Promise<Profile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getUserProfile(user: Principal): Promise<Profile | null>;
    getVerifiedAchievementsByCategory(category: AchievementCategory): Promise<Array<Achievement>>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: Profile): Promise<void>;
    searchAchievements(searchTerm: string): Promise<Array<Achievement>>;
    verifyAchievement(achievementId: string, status: VerificationStatus, notes: string | null): Promise<void>;
}
