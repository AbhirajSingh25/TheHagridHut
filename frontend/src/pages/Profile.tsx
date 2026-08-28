import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { FaGithub, FaLinkedin } from "react-icons/fa";

import {
  Award,
  BriefcaseBusiness,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronRight,
  Code2,
  Edit3,
  GraduationCap,
  Loader2,
  Mail,
  MapPin,
  Save,
  Sparkles,
  Target,
  Trash2,
  Trophy,
  User,
  X,
  Zap,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

interface ProfileData {
  name: string;
  email: string;
  role: string;
  location: string;
  university: string;
  graduationYear: string;
  bio: string;
  github: string;
  linkedin: string;
  avatar: string;
}

interface ActivityItem {
  id: number;
  title: string;
  description: string;
  time: string;
  icon: React.ReactNode;
}

const DEFAULT_PROFILE: ProfileData = {
  name: "Candidate",
  email: "",
  role: "Software Engineer",
  location: "India",
  university: "",
  graduationYear: "",
  bio:
    "Preparing for interviews, improving technical communication, and building stronger career readiness through AI-powered practice.",
  github: "",
  linkedin: "",
  avatar: "",
};

function getInitials(name: string) {
  const value = name.trim();

  if (!value) {
    return "U";
  }

  const words = value
    .split(" ")
    .filter(Boolean);

  if (words.length === 1) {
    return words[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`
    .toUpperCase();
}

function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] =
    useState<ProfileData>(
      DEFAULT_PROFILE
    );

  const [draft, setDraft] =
    useState<ProfileData>(
      DEFAULT_PROFILE
    );

  const [isEditing, setIsEditing] =
    useState(false);

  const [isSaving, setIsSaving] =
    useState(false);

  const [saveMessage, setSaveMessage] =
    useState("");

  const activity: ActivityItem[] = [
    {
      id: 1,
      title: "Profile created",
      description:
        "Your HireSense AI career profile is active and ready to collect intelligence.",
      time: "Recently",
      icon: (
        <User size={16} />
      ),
    },
    {
      id: 2,
      title: "Interview intelligence ready",
      description:
        "Performance signals will appear here after completed interview sessions.",
      time: "Ready",
      icon: (
        <Sparkles size={16} />
      ),
    },
    {
      id: 3,
      title: "Career progress tracking",
      description:
        "Completed interviews, reports and achievements will build your professional timeline.",
      time: "Active",
      icon: (
        <Target size={16} />
      ),
    },
  ];

  useEffect(() => {
    const storedProfile =
      localStorage.getItem(
        "hiresense_profile"
      );

    const storedUser =
      localStorage.getItem(
        "user"
      );

    let loadedProfile =
      DEFAULT_PROFILE;

    try {
      if (storedProfile) {
        loadedProfile = {
          ...DEFAULT_PROFILE,
          ...JSON.parse(
            storedProfile
          ),
        };
      } else if (storedUser) {
        const user =
          JSON.parse(
            storedUser
          );

        loadedProfile = {
          ...DEFAULT_PROFILE,
          name:
            user.username ||
            user.name ||
            DEFAULT_PROFILE.name,
          email:
            user.email ||
            "",
        };
      }
    } catch {
      loadedProfile =
        DEFAULT_PROFILE;
    }

    setProfile(
      loadedProfile
    );

    setDraft(
      loadedProfile
    );
  }, []);

  const completion =
    useMemo(() => {
      const fields = [
        profile.name,
        profile.email,
        profile.role,
        profile.location,
        profile.university,
        profile.graduationYear,
        profile.bio,
        profile.github,
        profile.linkedin,
        profile.avatar,
      ];

      const completed =
        fields.filter(
          (field) =>
            Boolean(
              field?.trim()
            )
        ).length;

      return Math.round(
        (
          completed /
          fields.length
        ) * 100
      );
    }, [profile]);

  const readinessLabel =
    useMemo(() => {
      if (completion >= 90) {
        return "Profile optimized";
      }

      if (completion >= 70) {
        return "Nearly complete";
      }

      if (completion >= 50) {
        return "Building profile";
      }

      return "Profile in progress";
    }, [completion]);

  const updateDraft = (
    field: keyof ProfileData,
    value: string
  ) => {
    setDraft(
      (previous) => ({
        ...previous,
        [field]: value,
      })
    );
  };

  const persistProfile = (
    nextProfile: ProfileData
  ) => {
    localStorage.setItem(
      "hiresense_profile",
      JSON.stringify(
        nextProfile
      )
    );

    setProfile(
      nextProfile
    );

    setDraft(
      nextProfile
    );

    window.dispatchEvent(
      new Event(
        "hiresense-profile-updated"
      )
    );
  };

  const handleAvatarChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      setSaveMessage(
        "Please select a valid image file"
      );
      return;
    }

    if (
      file.size >
      3 * 1024 * 1024
    ) {
      setSaveMessage(
        "Please choose an image smaller than 3 MB"
      );
      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      const avatar =
        typeof reader.result ===
        "string"
          ? reader.result
          : "";

      const nextProfile = {
        ...profile,
        avatar,
      };

      persistProfile(
        nextProfile
      );

      setSaveMessage(
        "Profile picture updated"
      );

      window.setTimeout(
        () =>
          setSaveMessage(
            ""
          ),
        3000
      );
    };

    reader.readAsDataURL(
      file
    );

    event.target.value = "";
  };

  const handleRemoveAvatar = () => {
    persistProfile({
      ...profile,
      avatar: "",
    });

    setSaveMessage(
      "Profile picture removed"
    );

    window.setTimeout(
      () =>
        setSaveMessage(
          ""
        ),
      3000
    );
  };

  const handleSave =
    async () => {
      setIsSaving(
        true
      );

      setSaveMessage(
        ""
      );

      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            700
          )
      );

      persistProfile(
        draft
      );

      setIsEditing(
        false
      );

      setIsSaving(
        false
      );

      setSaveMessage(
        "Profile updated successfully"
      );

      window.setTimeout(
        () =>
          setSaveMessage(
            ""
          ),
        3000
      );
    };

  const handleCancel =
    () => {
      setDraft(
        profile
      );

      setIsEditing(
        false
      );
    };

  const identitySignals = [
    {
      label: "Identity",
      value:
        profile.name &&
        profile.email
          ? "Complete"
          : "Pending",
      active:
        Boolean(
          profile.name &&
            profile.email
        ),
    },
    {
      label: "Career",
      value:
        profile.role
          ? "Defined"
          : "Pending",
      active:
        Boolean(
          profile.role
        ),
    },
    {
      label: "Presence",
      value:
        profile.github ||
        profile.linkedin
          ? "Connected"
          : "Not linked",
      active:
        Boolean(
          profile.github ||
            profile.linkedin
        ),
    },
  ];

  return (
    <div
      className="
        min-h-full
        px-4
        py-5
        pb-10
        md:px-6
        lg:px-8
        xl:px-10
      "
    >
      <div
        className="
          mx-auto
          max-w-[1500px]
        "
      >
        {/* ================================================
            HEADER
        ================================================ */}

        <section
          className="
            relative
            overflow-hidden
            rounded-2xl
            border
            border-white/[0.08]
            bg-[#0b0f19]/80
            px-5
            py-6
            backdrop-blur-xl
            md:px-7
            md:py-7
          "
        >
          <div
            className="
              pointer-events-none
              absolute
              right-[-120px]
              top-[-120px]
              h-[280px]
              w-[280px]
              rounded-full
              bg-purple-500/[0.10]
              blur-[100px]
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              left-[35%]
              top-[35%]
              h-[160px]
              w-[160px]
              rounded-full
              bg-cyan-400/[0.07]
              blur-[80px]
            "
          />

          <div
            className="
              relative
              flex
              flex-col
              gap-5
              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >
            <div>
              <div
                className="
                  mb-3
                  flex
                  items-center
                  gap-2
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.28em]
                  text-cyan-300
                "
              >
                <User
                  size={13}
                />

                Candidate identity
              </div>

              <h1
                className="
                  text-3xl
                  font-semibold
                  tracking-tight
                  text-white
                  md:text-4xl
                "
              >
                Your Profile
              </h1>

              <p
                className="
                  mt-2
                  max-w-2xl
                  text-sm
                  leading-6
                  text-slate-400
                "
              >
                Manage your professional
                identity, career preferences
                and intelligence profile used
                across HireSense AI.
              </p>
            </div>

            <div
              className="
                flex
                flex-wrap
                items-center
                gap-3
              "
            >
              {saveMessage && (
                <div
                  className="
                    flex
                    items-center
                    gap-2
                    rounded-xl
                    border
                    border-emerald-400/20
                    bg-emerald-400/[0.07]
                    px-4
                    py-3
                    text-xs
                    font-medium
                    text-emerald-300
                  "
                >
                  <CheckCircle2
                    size={15}
                  />

                  {saveMessage}
                </div>
              )}

              {!isEditing ? (
                <button
                  onClick={() =>
                    setIsEditing(
                      true
                    )
                  }
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-purple-400/20
                    bg-gradient-to-r
                    from-purple-600
                    to-cyan-500
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    text-white
                    shadow-lg
                    shadow-purple-900/20
                    transition
                    hover:brightness-110
                    active:scale-[0.98]
                  "
                >
                  <Edit3
                    size={16}
                  />

                  Edit profile
                </button>
              ) : (
                <>
                  <button
                    onClick={
                      handleCancel
                    }
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-xl
                      border
                      border-white/[0.08]
                      bg-white/[0.03]
                      px-4
                      py-3
                      text-sm
                      font-medium
                      text-slate-300
                      transition
                      hover:bg-white/[0.06]
                    "
                  >
                    <X
                      size={16}
                    />

                    Cancel
                  </button>

                  <button
                    onClick={
                      handleSave
                    }
                    disabled={
                      isSaving
                    }
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-xl
                      bg-gradient-to-r
                      from-purple-600
                      to-cyan-500
                      px-5
                      py-3
                      text-sm
                      font-semibold
                      text-white
                      transition
                      hover:brightness-110
                      disabled:cursor-not-allowed
                      disabled:opacity-70
                    "
                  >
                    {isSaving ? (
                      <Loader2
                        size={16}
                        className="
                          animate-spin
                        "
                      />
                    ) : (
                      <Save
                        size={16}
                      />
                    )}

                    {isSaving
                      ? "Saving..."
                      : "Save changes"}
                  </button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* ================================================
            MAIN PROFILE WORKSPACE
        ================================================ */}

        <section
          className="
            mt-5
            grid
            items-start
            gap-5
            xl:grid-cols-[380px_minmax(0,1fr)]
          "
        >
          {/* ================================================
              LEFT PROFILE INTELLIGENCE RAIL
          ================================================ */}

          <aside
            className="
              space-y-5
              xl:sticky
              xl:top-5
            "
          >
            {/* IDENTITY CARD */}

            <div
              className="
                relative
                overflow-hidden
                rounded-2xl
                border
                border-white/[0.08]
                bg-[#0b0f19]/80
                p-5
                backdrop-blur-xl
              "
            >
              <div
                className="
                  pointer-events-none
                  absolute
                  -right-16
                  -top-16
                  h-40
                  w-40
                  rounded-full
                  bg-purple-500/[0.10]
                  blur-[70px]
                "
              />

              <div
                className="
                  relative
                  flex
                  flex-col
                  items-center
                  text-center
                "
              >
                <div
                  className="
                    group
                    relative
                    h-28
                    w-28
                    overflow-hidden
                    rounded-3xl
                    border
                    border-purple-400/30
                    bg-gradient-to-br
                    from-purple-600
                    via-purple-500
                    to-cyan-500
                    shadow-xl
                    shadow-purple-900/30
                  "
                >
                  {profile.avatar ? (
                    <img
                      src={
                        profile.avatar
                      }
                      alt={`${profile.name} profile`}
                      className="
                        h-full
                        w-full
                        object-cover
                      "
                    />
                  ) : (
                    <div
                      className="
                        flex
                        h-full
                        w-full
                        items-center
                        justify-center
                        text-3xl
                        font-bold
                        text-white
                      "
                    >
                      {getInitials(
                        profile.name
                      )}
                    </div>
                  )}

                  <label
                    className="
                      absolute
                      inset-x-0
                      bottom-0
                      flex
                      h-10
                      cursor-pointer
                      items-center
                      justify-center
                      gap-2
                      bg-black/60
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[0.14em]
                      text-white
                      opacity-0
                      backdrop-blur-sm
                      transition
                      group-hover:opacity-100
                    "
                  >
                    <Camera
                      size={13}
                    />

                    Change

                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={
                        handleAvatarChange
                      }
                    />
                  </label>

                  <span
                    className="
                      absolute
                      bottom-1.5
                      right-1.5
                      h-4
                      w-4
                      rounded-full
                      border-[3px]
                      border-[#0b0f19]
                      bg-emerald-400
                    "
                  />
                </div>

                <div
                  className="
                    mt-3
                    flex
                    items-center
                    gap-2
                  "
                >
                  <label
                    className="
                      inline-flex
                      cursor-pointer
                      items-center
                      gap-2
                      rounded-lg
                      border
                      border-white/[0.08]
                      bg-white/[0.025]
                      px-3
                      py-2
                      text-[10px]
                      font-medium
                      text-slate-300
                      transition
                      hover:border-purple-400/25
                      hover:bg-purple-400/[0.06]
                    "
                  >
                    <Camera
                      size={13}
                    />

                    {profile.avatar
                      ? "Change photo"
                      : "Add photo"}

                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={
                        handleAvatarChange
                      }
                    />
                  </label>

                  {profile.avatar && (
                    <button
                      type="button"
                      onClick={
                        handleRemoveAvatar
                      }
                      className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-lg
                        border
                        border-red-400/15
                        bg-red-400/[0.04]
                        px-3
                        py-2
                        text-[10px]
                        font-medium
                        text-red-300
                        transition
                        hover:bg-red-400/[0.08]
                      "
                    >
                      <Trash2
                        size={13}
                      />

                      Remove
                    </button>
                  )}
                </div>

                <h2
                  className="
                    mt-5
                    text-xl
                    font-semibold
                    text-white
                  "
                >
                  {profile.name}
                </h2>

                <p
                  className="
                    mt-1
                    text-sm
                    text-slate-400
                  "
                >
                  {profile.role}
                </p>

                <div
                  className="
                    mt-4
                    flex
                    flex-wrap
                    justify-center
                    gap-2
                  "
                >
                  {profile.location && (
                    <div
                      className="
                        inline-flex
                        items-center
                        gap-1.5
                        rounded-lg
                        border
                        border-white/[0.07]
                        bg-white/[0.03]
                        px-3
                        py-2
                        text-xs
                        text-slate-400
                      "
                    >
                      <MapPin
                        size={13}
                      />

                      {profile.location}
                    </div>
                  )}

                  {profile.graduationYear && (
                    <div
                      className="
                        inline-flex
                        items-center
                        gap-1.5
                        rounded-lg
                        border
                        border-white/[0.07]
                        bg-white/[0.03]
                        px-3
                        py-2
                        text-xs
                        text-slate-400
                      "
                    >
                      <CalendarDays
                        size={13}
                      />

                      {profile.graduationYear}
                    </div>
                  )}
                </div>
              </div>

              {/* COMPLETION */}

              <div
                className="
                  mt-6
                  rounded-2xl
                  border
                  border-cyan-400/10
                  bg-cyan-400/[0.025]
                  p-4
                "
              >
                <div
                  className="
                    flex
                    items-start
                    justify-between
                    gap-4
                  "
                >
                  <div>
                    <p
                      className="
                        text-xs
                        font-medium
                        text-slate-300
                      "
                    >
                      Profile completeness
                    </p>

                    <p
                      className="
                        mt-1
                        text-[11px]
                        leading-5
                        text-slate-500
                      "
                    >
                      {readinessLabel}
                    </p>
                  </div>

                  <span
                    className="
                      text-xl
                      font-semibold
                      text-cyan-300
                    "
                  >
                    {completion}%
                  </span>
                </div>

                <div
                  className="
                    mt-4
                    h-2
                    overflow-hidden
                    rounded-full
                    bg-white/[0.06]
                  "
                >
                  <div
                    className="
                      h-full
                      rounded-full
                      bg-gradient-to-r
                      from-purple-500
                      via-cyan-400
                      to-emerald-400
                      transition-all
                      duration-700
                    "
                    style={{
                      width:
                        `${completion}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* PROFILE SNAPSHOT */}

            <div
              className="
                rounded-2xl
                border
                border-white/[0.08]
                bg-[#0b0f19]/80
                p-5
                backdrop-blur-xl
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-between
                "
              >
                <div>
                  <p
                    className="
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[0.22em]
                      text-purple-300
                    "
                  >
                    Profile intelligence
                  </p>

                  <h3
                    className="
                      mt-1
                      text-base
                      font-semibold
                      text-white
                    "
                  >
                    Candidate snapshot
                  </h3>
                </div>

                <div
                  className="
                    rounded-xl
                    border
                    border-purple-400/15
                    bg-purple-400/[0.06]
                    p-2.5
                    text-purple-300
                  "
                >
                  <Zap
                    size={16}
                  />
                </div>
              </div>

              <div
                className="
                  mt-5
                  space-y-2
                "
              >
                {identitySignals.map(
                  (signal) => (
                    <div
                      key={
                        signal.label
                      }
                      className="
                        flex
                        items-center
                        justify-between
                        rounded-xl
                        border
                        border-white/[0.06]
                        bg-white/[0.015]
                        px-4
                        py-3
                      "
                    >
                      <span
                        className="
                          text-xs
                          text-slate-400
                        "
                      >
                        {signal.label}
                      </span>

                      <span
                        className={`
                          text-[10px]
                          font-medium
                          ${
                            signal.active
                              ? "text-emerald-300"
                              : "text-amber-300"
                          }
                        `}
                      >
                        {signal.value}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* QUICK ACTIONS */}

            <div
              className="
                rounded-2xl
                border
                border-white/[0.08]
                bg-[#0b0f19]/80
                p-3
                backdrop-blur-xl
              "
            >
              <button
                onClick={() =>
                  navigate(
                    "/resume-analyzer"
                  )
                }
                className="
                  group
                  flex
                  w-full
                  items-center
                  justify-between
                  rounded-xl
                  px-3
                  py-3
                  text-left
                  transition
                  hover:bg-white/[0.035]
                "
              >
                <span
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >
                  <span
                    className="
                      rounded-lg
                      border
                      border-cyan-400/15
                      bg-cyan-400/[0.06]
                      p-2
                      text-cyan-300
                    "
                  >
                    <Code2
                      size={15}
                    />
                  </span>

                  <span>
                    <span
                      className="
                        block
                        text-sm
                        font-medium
                        text-slate-200
                      "
                    >
                      Resume intelligence
                    </span>

                    <span
                      className="
                        mt-0.5
                        block
                        text-[11px]
                        text-slate-500
                      "
                    >
                      Improve your profile
                    </span>
                  </span>
                </span>

                <ChevronRight
                  size={16}
                  className="
                    text-slate-600
                    transition
                    group-hover:translate-x-0.5
                    group-hover:text-cyan-300
                  "
                />
              </button>

              <div
                className="
                  mx-3
                  border-t
                  border-white/[0.05]
                "
              />

              <button
                onClick={() =>
                  navigate(
                    "/mock-interview"
                  )
                }
                className="
                  group
                  flex
                  w-full
                  items-center
                  justify-between
                  rounded-xl
                  px-3
                  py-3
                  text-left
                  transition
                  hover:bg-white/[0.035]
                "
              >
                <span
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >
                  <span
                    className="
                      rounded-lg
                      border
                      border-purple-400/15
                      bg-purple-400/[0.06]
                      p-2
                      text-purple-300
                    "
                  >
                    <Target
                      size={15}
                    />
                  </span>

                  <span>
                    <span
                      className="
                        block
                        text-sm
                        font-medium
                        text-slate-200
                      "
                    >
                      Start practice
                    </span>

                    <span
                      className="
                        mt-0.5
                        block
                        text-[11px]
                        text-slate-500
                      "
                    >
                      Build interview readiness
                    </span>
                  </span>
                </span>

                <ChevronRight
                  size={16}
                  className="
                    text-slate-600
                    transition
                    group-hover:translate-x-0.5
                    group-hover:text-purple-300
                  "
                />
              </button>
            </div>
          </aside>

          {/* ================================================
              RIGHT PROFILE CONTENT
          ================================================ */}

          <div
            className="
              space-y-5
            "
          >
            {/* PROFESSIONAL PROFILE */}

            <section
              className="
                rounded-2xl
                border
                border-white/[0.08]
                bg-[#0b0f19]/80
                p-5
                backdrop-blur-xl
                md:p-6
              "
            >
              <div
                className="
                  flex
                  flex-col
                  gap-4
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >
                  <div
                    className="
                      rounded-xl
                      border
                      border-purple-400/15
                      bg-purple-400/[0.06]
                      p-2.5
                      text-purple-300
                    "
                  >
                    <BriefcaseBusiness
                      size={18}
                    />
                  </div>

                  <div>
                    <p
                      className="
                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-[0.22em]
                        text-purple-300
                      "
                    >
                      Professional profile
                    </p>

                    <h2
                      className="
                        mt-1
                        text-lg
                        font-semibold
                        text-white
                      "
                    >
                      Career information
                    </h2>
                  </div>
                </div>

                <div
                  className="
                    rounded-xl
                    border
                    border-white/[0.07]
                    bg-white/[0.02]
                    px-3
                    py-2
                    text-[11px]
                    text-slate-500
                  "
                >
                  Used by AI interview
                  personalization
                </div>
              </div>

              <div
                className="
                  mt-7
                  grid
                  gap-4
                  md:grid-cols-2
                  xl:grid-cols-3
                "
              >
                <ProfileField
                  label="Full name"
                  value={
                    draft.name
                  }
                  disabled={
                    !isEditing
                  }
                  onChange={(
                    value
                  ) =>
                    updateDraft(
                      "name",
                      value
                    )
                  }
                  icon={
                    <User
                      size={15}
                    />
                  }
                />

                <ProfileField
                  label="Email address"
                  value={
                    draft.email
                  }
                  disabled={
                    !isEditing
                  }
                  onChange={(
                    value
                  ) =>
                    updateDraft(
                      "email",
                      value
                    )
                  }
                  icon={
                    <Mail
                      size={15}
                    />
                  }
                  type="email"
                />

                <ProfileField
                  label="Target role"
                  value={
                    draft.role
                  }
                  disabled={
                    !isEditing
                  }
                  onChange={(
                    value
                  ) =>
                    updateDraft(
                      "role",
                      value
                    )
                  }
                  icon={
                    <BriefcaseBusiness
                      size={15}
                    />
                  }
                />

                <ProfileField
                  label="Location"
                  value={
                    draft.location
                  }
                  disabled={
                    !isEditing
                  }
                  onChange={(
                    value
                  ) =>
                    updateDraft(
                      "location",
                      value
                    )
                  }
                  icon={
                    <MapPin
                      size={15}
                    />
                  }
                />

                <ProfileField
                  label="University / Institution"
                  value={
                    draft.university
                  }
                  disabled={
                    !isEditing
                  }
                  onChange={(
                    value
                  ) =>
                    updateDraft(
                      "university",
                      value
                    )
                  }
                  icon={
                    <GraduationCap
                      size={15}
                    />
                  }
                />

                <ProfileField
                  label="Graduation year"
                  value={
                    draft.graduationYear
                  }
                  disabled={
                    !isEditing
                  }
                  onChange={(
                    value
                  ) =>
                    updateDraft(
                      "graduationYear",
                      value
                    )
                  }
                  icon={
                    <CalendarDays
                      size={15}
                    />
                  }
                />
              </div>

              {/* SUMMARY */}

              <div
                className="
                  mt-6
                "
              >
                <label
                  className="
                    mb-2
                    flex
                    items-center
                    gap-2
                    text-xs
                    font-medium
                    text-slate-400
                  "
                >
                  <Sparkles
                    size={14}
                    className="
                      text-purple-300
                    "
                  />

                  Professional summary
                </label>

                {isEditing ? (
                  <textarea
                    value={
                      draft.bio
                    }
                    onChange={(
                      event
                    ) =>
                      updateDraft(
                        "bio",
                        event.target
                          .value
                      )
                    }
                    rows={4}
                    className="
                      w-full
                      resize-none
                      rounded-xl
                      border
                      border-white/[0.09]
                      bg-white/[0.025]
                      px-4
                      py-3
                      text-sm
                      leading-6
                      text-slate-200
                      outline-none
                      transition
                      placeholder:text-slate-600
                      focus:border-purple-400/30
                      focus:bg-white/[0.04]
                    "
                  />
                ) : (
                  <div
                    className="
                      rounded-xl
                      border
                      border-white/[0.07]
                      bg-white/[0.02]
                      px-4
                      py-4
                      text-sm
                      leading-6
                      text-slate-400
                    "
                  >
                    {profile.bio ||
                      "No professional summary added yet."}
                  </div>
                )}
              </div>
            </section>

            {/* LINKS + PROFILE STATUS */}

            <div
              className="
                grid
                gap-5
                lg:grid-cols-[1.35fr_0.65fr]
              "
            >
              {/* CAREER LINKS */}

              <section
                className="
                  rounded-2xl
                  border
                  border-white/[0.08]
                  bg-[#0b0f19]/80
                  p-5
                  backdrop-blur-xl
                  md:p-6
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >
                  <div
                    className="
                      rounded-xl
                      border
                      border-cyan-400/15
                      bg-cyan-400/[0.06]
                      p-2.5
                      text-cyan-300
                    "
                  >
                    <Code2
                      size={18}
                    />
                  </div>

                  <div>
                    <p
                      className="
                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-[0.22em]
                        text-cyan-300
                      "
                    >
                      Professional presence
                    </p>

                    <h2
                      className="
                        mt-1
                        text-lg
                        font-semibold
                        text-white
                      "
                    >
                      Career links
                    </h2>
                  </div>
                </div>

                <div
                  className="
                    mt-6
                    grid
                    gap-4
                    md:grid-cols-2
                  "
                >
                  <ProfileField
                    label="GitHub profile"
                    value={
                      draft.github
                    }
                    disabled={
                      !isEditing
                    }
                    onChange={(
                      value
                    ) =>
                      updateDraft(
                        "github",
                        value
                      )
                    }
                    icon={
                      <FaGithub
                        size={15}
                      />
                    }
                    placeholder="https://github.com/username"
                  />

                  <ProfileField
                    label="LinkedIn profile"
                    value={
                      draft.linkedin
                    }
                    disabled={
                      !isEditing
                    }
                    onChange={(
                      value
                    ) =>
                      updateDraft(
                        "linkedin",
                        value
                      )
                    }
                    icon={
                      <FaLinkedin
                        size={15}
                      />
                    }
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
              </section>

              {/* PROFILE STATUS */}

              <section
                className="
                  relative
                  overflow-hidden
                  rounded-2xl
                  border
                  border-white/[0.08]
                  bg-[#0b0f19]/80
                  p-5
                  backdrop-blur-xl
                  md:p-6
                "
              >
                <div
                  className="
                    pointer-events-none
                    absolute
                    -bottom-16
                    -right-16
                    h-36
                    w-36
                    rounded-full
                    bg-cyan-400/[0.08]
                    blur-[60px]
                  "
                />

                <div
                  className="
                    relative
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      justify-between
                    "
                  >
                    <div>
                      <p
                        className="
                          text-[10px]
                          font-semibold
                          uppercase
                          tracking-[0.22em]
                          text-amber-300
                        "
                      >
                        Candidate status
                      </p>

                      <h2
                        className="
                          mt-1
                          text-lg
                          font-semibold
                          text-white
                        "
                      >
                        Profile signal
                      </h2>
                    </div>

                    <div
                      className="
                        rounded-xl
                        border
                        border-amber-400/15
                        bg-amber-400/[0.06]
                        p-2.5
                        text-amber-300
                      "
                    >
                      <Award
                        size={17}
                      />
                    </div>
                  </div>

                  <div
                    className="
                      mt-8
                      text-center
                    "
                  >
                    <div
                      className="
                        inline-flex
                        h-24
                        w-24
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-cyan-400/20
                        bg-cyan-400/[0.04]
                        text-2xl
                        font-semibold
                        text-cyan-300
                        shadow-[0_0_45px_rgba(34,211,238,0.08)]
                      "
                    >
                      {completion}%
                    </div>

                    <p
                      className="
                        mt-4
                        text-sm
                        font-medium
                        text-slate-200
                      "
                    >
                      {readinessLabel}
                    </p>

                    <p
                      className="
                        mt-1
                        text-[11px]
                        leading-5
                        text-slate-500
                      "
                    >
                      Complete more profile
                      signals to improve AI
                      personalization.
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* ACTIVITY */}

            <section
              className="
                rounded-2xl
                border
                border-white/[0.08]
                bg-[#0b0f19]/80
                p-5
                backdrop-blur-xl
                md:p-6
              "
            >
              <div
                className="
                  mb-6
                  flex
                  items-center
                  justify-between
                "
              >
                <div>
                  <p
                    className="
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[0.22em]
                      text-amber-300
                    "
                  >
                    Career timeline
                  </p>

                  <h2
                    className="
                      mt-1
                      text-lg
                      font-semibold
                      text-white
                    "
                  >
                    Recent activity
                  </h2>
                </div>

                <div
                  className="
                    rounded-xl
                    border
                    border-amber-400/15
                    bg-amber-400/[0.06]
                    p-2.5
                    text-amber-300
                  "
                >
                  <Trophy
                    size={17}
                  />
                </div>
              </div>

              <div
                className="
                  grid
                  gap-3
                  lg:grid-cols-3
                "
              >
                {activity.map(
                  (item) => (
                    <div
                      key={
                        item.id
                      }
                      className="
                        rounded-xl
                        border
                        border-white/[0.06]
                        bg-white/[0.015]
                        p-4
                        transition
                        hover:border-purple-400/15
                        hover:bg-white/[0.03]
                      "
                    >
                      <div
                        className="
                          flex
                          items-start
                          justify-between
                          gap-4
                        "
                      >
                        <div
                          className="
                            flex
                            h-9
                            w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            border
                            border-purple-400/15
                            bg-purple-400/[0.06]
                            text-purple-300
                          "
                        >
                          {item.icon}
                        </div>

                        <span
                          className="
                            text-[10px]
                            text-slate-600
                          "
                        >
                          {item.time}
                        </span>
                      </div>

                      <h3
                        className="
                          mt-4
                          text-sm
                          font-medium
                          text-slate-200
                        "
                      >
                        {item.title}
                      </h3>

                      <p
                        className="
                          mt-2
                          text-xs
                          leading-5
                          text-slate-500
                        "
                      >
                        {
                          item.description
                        }
                      </p>
                    </div>
                  )
                )}
              </div>
            </section>
          </div>
        </section>
      </div>
    </div>
  );
}

interface ProfileFieldProps {
  label: string;
  value: string;
  disabled: boolean;
  onChange: (
    value: string
  ) => void;
  icon: React.ReactNode;
  type?: string;
  placeholder?: string;
}

function ProfileField({
  label,
  value,
  disabled,
  onChange,
  icon,
  type = "text",
  placeholder = "",
}: ProfileFieldProps) {
  return (
    <div>
      <label
        className="
          mb-2
          flex
          items-center
          gap-2
          text-xs
          font-medium
          text-slate-400
        "
      >
        <span
          className="
            text-slate-500
          "
        >
          {icon}
        </span>

        {label}
      </label>

      {disabled ? (
        <div
          className="
            flex
            min-h-[48px]
            items-center
            rounded-xl
            border
            border-white/[0.07]
            bg-white/[0.02]
            px-4
            text-sm
            text-slate-300
          "
        >
          {value ||
            "Not provided"}
        </div>
      ) : (
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          className="
            min-h-[48px]
            w-full
            rounded-xl
            border
            border-white/[0.09]
            bg-white/[0.025]
            px-4
            text-sm
            text-slate-200
            outline-none
            transition
            placeholder:text-slate-600
            focus:border-purple-400/30
            focus:bg-white/[0.04]
          "
        />
      )}
    </div>
  );
}

export default Profile;