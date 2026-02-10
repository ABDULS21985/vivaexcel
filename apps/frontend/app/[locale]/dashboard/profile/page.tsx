"use client";

import { useState, useRef, type FormEvent } from "react";
import {
  Camera,
  Globe,
  Loader2,
  Save,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  X,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { PasswordStrength } from "@/components/auth/password-strength";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

// =============================================================================
// Profile Settings Page
// =============================================================================
// User profile settings: avatar upload, name, email, bio, social links,
// change password, and delete account with confirmation modal.

function ProfileContent() {
  const { user, updateProfile, changePassword, deleteAccount } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile form state
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [website, setWebsite] = useState(user?.website || "");
  const [twitter, setTwitter] = useState(user?.socialLinks?.twitter || "");
  const [linkedin, setLinkedin] = useState(user?.socialLinks?.linkedin || "");
  const [github, setGithub] = useState(user?.socialLinks?.github || "");
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Avatar upload state
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Delete account
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be smaller than 2MB.");
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to API
    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await apiClient<{ user: { avatar: string } }>(
        "/auth/avatar",
        {
          method: "POST",
          body: formData,
          headers: {},
        }
      );
      setAvatarPreview(response.user.avatar);
      toast.success("Avatar updated successfully!");
    } catch (error) {
      // Revert preview on failure
      setAvatarPreview(user?.avatar || "");
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to upload avatar. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  async function handleProfileSave(e: FormEvent) {
    e.preventDefault();
    setSaveError("");
    setSaveSuccess(false);
    setIsSaving(true);

    try {
      await updateProfile({
        firstName,
        lastName,
        bio,
        website,
        socialLinks: { twitter, linkedin, github },
      });
      setSaveSuccess(true);
      toast.success("Profile updated successfully!");
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update profile. Please try again.";
      setSaveError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePasswordChange(e: FormEvent) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (!currentPassword) {
      setPasswordError("Current password is required");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      toast.success("Password changed successfully!");
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to change password. Please check your current password.";
      setPasswordError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsChangingPassword(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirmText !== "DELETE") return;

    setIsDeleting(true);
    try {
      await deleteAccount();
      toast.success("Your account has been deleted.");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to delete account. Please try again.";
      toast.error(errorMessage);
      setIsDeleting(false);
    }
  }

  return (
    <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)] mb-8">
          Profile Settings
        </h1>

        {/* Profile Form */}
        <form onSubmit={handleProfileSave}>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 md:p-8 mb-6">
            {/* Avatar */}
            <div className="flex items-center gap-5 mb-8">
              <div className="relative group">
                <div className="w-20 h-20 rounded-full bg-[var(--surface-2)] overflow-hidden flex items-center justify-center border-2 border-[var(--border)]">
                  {avatarPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-[var(--muted-foreground)]">
                      {(user?.firstName?.[0] || "U").toUpperCase()}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-100"
                  aria-label="Upload avatar"
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="h-5 w-5 text-white animate-spin" />
                  ) : (
                    <Camera className="h-5 w-5 text-white" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">
                  Profile Photo
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  JPG, PNG or GIF. Max 2MB.
                </p>
              </div>
            </div>

            {/* Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
                >
                  First name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-colors"
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
                >
                  Last name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-colors"
                />
              </div>
            </div>

            {/* Email (readonly) */}
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={user?.email || ""}
                readOnly
                className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] text-[var(--muted-foreground)] cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Email cannot be changed. Contact support if you need help.
              </p>
            </div>

            {/* Bio */}
            <div className="mb-4">
              <label
                htmlFor="bio"
                className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
              >
                Bio
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                maxLength={300}
                placeholder="Tell us a little about yourself..."
                className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-colors resize-none"
              />
              <p className="mt-1 text-xs text-[var(--muted-foreground)] text-right">
                {bio.length}/300
              </p>
            </div>

            {/* Website & Social Links */}
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="website"
                  className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
                >
                  Website
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                  <input
                    id="website"
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://yoursite.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="twitter"
                    className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
                  >
                    Twitter / X
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--muted-foreground)]">
                      @
                    </span>
                    <input
                      id="twitter"
                      type="text"
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value)}
                      placeholder="username"
                      className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="linkedin"
                    className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
                  >
                    LinkedIn
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--muted-foreground)]">
                      in/
                    </span>
                    <input
                      id="linkedin"
                      type="text"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      placeholder="username"
                      className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="github"
                    className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
                  >
                    GitHub
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--muted-foreground)]">
                      @
                    </span>
                    <input
                      id="github"
                      type="text"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      placeholder="username"
                      className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center gap-3 mb-8">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed btn-press"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
            {saveSuccess && (
              <span className="text-sm text-green-600 dark:text-green-400 animate-fade-in">
                Profile updated successfully!
              </span>
            )}
            {saveError && (
              <span className="text-sm text-[var(--error)] animate-fade-in">
                {saveError}
              </span>
            )}
          </div>
        </form>

        {/* Change Password */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 md:p-8 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <Lock className="h-5 w-5 text-[var(--muted-foreground)]" />
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Change Password
            </h2>
          </div>

          {passwordSuccess && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm">
              Password changed successfully!
            </div>
          )}
          {passwordError && (
            <div className="mb-4 p-3 rounded-lg bg-[var(--error-light)] dark:bg-red-900/20 border border-[var(--error)]/20 text-[var(--error-dark)] dark:text-red-400 text-sm">
              {passwordError}
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
              >
                Current password
              </label>
              <div className="relative">
                <input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 pr-10 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-colors"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
              >
                New password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 pr-10 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-colors"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <PasswordStrength password={newPassword} />
            </div>

            <div>
              <label
                htmlFor="confirmNewPassword"
                className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
              >
                Confirm new password
              </label>
              <input
                id="confirmNewPassword"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-lg border bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-colors ${
                  confirmNewPassword && confirmNewPassword !== newPassword
                    ? "border-[var(--error)]"
                    : "border-[var(--border)]"
                }`}
                required
                autoComplete="new-password"
              />
              {confirmNewPassword && confirmNewPassword !== newPassword && (
                <p className="mt-1 text-xs text-[var(--error)]">
                  Passwords do not match
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isChangingPassword}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed btn-press"
            >
              {isChangingPassword ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Changing password...
                </>
              ) : (
                "Change Password"
              )}
            </button>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="bg-[var(--card)] border border-red-200 dark:border-red-900/50 rounded-xl p-6 md:p-8">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-[var(--error)]" />
            <h2 className="text-lg font-semibold text-[var(--error)]">
              Danger Zone
            </h2>
          </div>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            Permanently delete your account and all associated data. This action
            cannot be undone.
          </p>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[var(--error)] text-[var(--error)] text-sm font-medium hover:bg-[var(--error)] hover:text-white transition-colors"
          >
            Delete Account
          </button>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => {
                if (!isDeleting) {
                  setShowDeleteModal(false);
                }
              }}
              role="presentation"
            />
            <div className="relative bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-fade-in-scale">
              <button
                type="button"
                onClick={() => {
                  if (!isDeleting) {
                    setShowDeleteModal(false);
                  }
                }}
                disabled={isDeleting}
                className="absolute top-4 right-4 text-[var(--muted-foreground)] hover:text-[var(--foreground)] disabled:opacity-50"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="text-center mb-6">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <AlertTriangle className="h-7 w-7 text-[var(--error)]" />
                </div>
                <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">
                  Delete Account
                </h3>
                <p className="text-sm text-[var(--muted-foreground)]">
                  This will permanently delete your account, all your data,
                  reading history, and bookmarks. This action cannot be undone.
                </p>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="deleteConfirm"
                  className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
                >
                  Type <span className="font-bold">DELETE</span> to confirm
                </label>
                <input
                  id="deleteConfirm"
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmText("");
                  }}
                  className="flex-1 py-2.5 rounded-lg border border-[var(--border)] text-[var(--foreground)] text-sm font-medium hover:bg-[var(--surface-1)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleteConfirmText !== "DELETE" || isDeleting}
                  onClick={handleDeleteAccount}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[var(--error)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Account"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

export default function ProfileSettingsPage() {
  return <ProfileContent />;
}
