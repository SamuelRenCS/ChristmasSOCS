import React, { useState, useEffect } from "react";
import UserProfile from "./UserProfile";
import { updatePassword, fetchUserProfile } from "../../api/api";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

function ProfilePage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch user profile when component mounts
    const loadUserProfile = async () => {
      try {
        if (!user) {
          return;
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch user profile", error);
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  const handleUpdatePassword = async (passwordData) => {
    try {
      // add the user id to the password data
      passwordData.userId = user.id;
      const response = await updatePassword(passwordData);

      toast.success(response.message || "Password updated successfully");
    } catch (error) {
      toast.error("Failed to update password");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <UserProfile user={user} onUpdatePassword={handleUpdatePassword} />;
}

export default ProfilePage;
