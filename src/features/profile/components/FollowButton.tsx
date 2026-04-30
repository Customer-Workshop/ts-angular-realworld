import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import * as profileService from '../../../services/profile.service';
import { Profile } from '../../../models/profile.model';

interface FollowButtonProps {
  profile: Profile;
  onToggle: (profile: Profile) => void;
}

export default function FollowButton({ profile, onToggle }: FollowButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const toggleFollowing = async () => {
    setIsSubmitting(true);

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const updatedProfile = profile.following
        ? await profileService.unfollow(profile.username)
        : await profileService.follow(profile.username);
      setIsSubmitting(false);
      onToggle(updatedProfile);
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <button
      className={`btn btn-sm action-btn ${profile.following ? 'btn-secondary' : 'btn-outline-secondary'} ${isSubmitting ? 'disabled' : ''}`}
      onClick={toggleFollowing}
    >
      <i className="ion-plus-round"></i>
      &nbsp;
      {profile.following ? 'Unfollow' : 'Follow'} {profile.username}
    </button>
  );
}
