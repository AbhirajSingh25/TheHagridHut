import { useMemo, useState } from "react";

import {
  ArrowUpRight,
  BrainCircuit,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileSearch,
  Filter,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Users,
  X,
  Zap,
} from "lucide-react";


type CandidateStatus =
  | "Recommended"
  | "Review"
  | "Interview"
  | "Strong Match";


type Candidate = {
  id: number;
  name: string;
  role: string;
  initials: string;
  match: number;
  status: CandidateStatus;
  skills: string[];
  experience: string;
  score: number;
};


const candidates: Candidate[] = [
  {
    id: 1,
    name: "Arjun Mehta",
    role: "Frontend Engineer",
    initials: "AM",
    match: 94,
    status: "Strong Match",
    skills: [
      "React",
      "TypeScript",
      "System Design",
    ],
    experience: "2.5 years",
    score: 91,
  },
  {
    id: 2,
    name: "Priya Sharma",
    role: "Software Engineer",
    initials: "PS",
    match: 89,
    status: "Recommended",
    skills: [
      "Java",
      "Spring Boot",
      "SQL",
    ],
    experience: "2 years",
    score: 86,
  },
  {
    id: 3,
    name: "Rohan Kapoor",
    role: "AI Engineer",
    initials: "RK",
    match: 82,
    status: "Interview",
    skills: [
      "Python",
      "LLMs",
      "Machine Learning",
    ],
    experience: "1.8 years",
    score: 83,
  },
  {
    id: 4,
    name: "Ananya Verma",
    role: "Backend Engineer",
    initials: "AV",
    match: 77,
    status: "Review",
    skills: [
      "Python",
      "FastAPI",
      "PostgreSQL",
    ],
    experience: "1.5 years",
    score: 79,
  },
];


const pipeline = [
  {
    label: "Discovered",
    value: 124,
    detail: "Candidate profiles",
    icon: Users,
  },
  {
    label: "Shortlisted",
    value: 38,
    detail: "High relevance",
    icon: Star,
  },
  {
    label: "Interviewing",
    value: 12,
    detail: "Active sessions",
    icon: BrainCircuit,
  },
  {
    label: "Decision",
    value: 6,
    detail: "Ready for review",
    icon: CheckCircle2,
  },
];


const statusStyles: Record<
  CandidateStatus,
  string
> = {
  "Strong Match":
    "border-emerald-400/15 bg-emerald-400/[0.05] text-emerald-300",

  Recommended:
    "border-cyan-400/15 bg-cyan-400/[0.05] text-cyan-300",

  Interview:
    "border-violet-400/15 bg-violet-400/[0.05] text-violet-300",

  Review:
    "border-amber-400/15 bg-amber-400/[0.05] text-amber-300",
};


function RecruiterDashboard() {
  const [search, setSearch] =
    useState("");

  const [filterOpen, setFilterOpen] =
    useState(false);

  const [selectedStatus, setSelectedStatus] =
    useState<
      CandidateStatus | "All"
    >("All");

  const [selectedCandidate, setSelectedCandidate] =
    useState<Candidate | null>(
      null
    );


  const filteredCandidates =
    useMemo(
      () =>
        candidates.filter(
          (
            candidate
          ) => {
            const searchMatch =
              candidate.name
                .toLowerCase()
                .includes(
                  search.toLowerCase()
                ) ||
              candidate.role
                .toLowerCase()
                .includes(
                  search.toLowerCase()
                );

            const statusMatch =
              selectedStatus ===
                "All" ||
              candidate.status ===
                selectedStatus;

            return (
              searchMatch &&
              statusMatch
            );
          }
        ),
      [
        search,
        selectedStatus,
      ]
    );


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

        {/* HERO */}

        <section
          className="
            relative
            overflow-hidden
            rounded-2xl
            border
            border-white/[0.07]
            bg-[#0b0f19]/80
            px-5
            py-7
            md:px-7
            md:py-8
          "
        >
          <div
            className="
              pointer-events-none
              absolute
              -left-24
              top-[-160px]
              h-[350px]
              w-[350px]
              rounded-full
              bg-cyan-400/[0.06]
              blur-[140px]
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -right-20
              bottom-[-180px]
              h-[330px]
              w-[330px]
              rounded-full
              bg-violet-500/[0.08]
              blur-[140px]
            "
          />

          <div
            className="
              relative
              flex
              flex-col
              gap-8
              xl:flex-row
              xl:items-center
              xl:justify-between
            "
          >
            <div>
              <div
                className="
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
                <BriefcaseBusiness
                  size={13}
                />

                Talent Intelligence
              </div>

              <h1
                className="
                  mt-4
                  text-3xl
                  font-semibold
                  tracking-tight
                  text-white
                  md:text-4xl
                "
              >
                Find stronger candidates.
                <br />

                <span
                  className="
                    bg-gradient-to-r
                    from-cyan-300
                    via-sky-300
                    to-violet-300
                    bg-clip-text
                    text-transparent
                  "
                >
                  Make clearer decisions.
                </span>
              </h1>

              <p
                className="
                  mt-3
                  max-w-2xl
                  text-sm
                  leading-6
                  text-slate-400
                "
              >
                A focused AI-assisted workspace for understanding
                candidate quality, interview readiness and role
                alignment across your hiring pipeline.
              </p>
            </div>


            <div
              className="
                grid
                grid-cols-2
                gap-3
                self-start
                sm:grid-cols-3
              "
            >
              <HeroMetric
                label="Active roles"
                value="08"
              />

              <HeroMetric
                label="Candidates"
                value="124"
              />

              <HeroMetric
                label="Strong matches"
                value="18"
              />
            </div>
          </div>
        </section>


        {/* PIPELINE */}

        <section
          className="
            mt-6
            grid
            gap-4
            sm:grid-cols-2
            xl:grid-cols-4
          "
        >
          {
            pipeline.map(
              (
                item
              ) => {
                const Icon =
                  item.icon;

                return (
                  <div
                    key={
                      item.label
                    }
                    className="
                      group
                      relative
                      overflow-hidden
                      rounded-2xl
                      border
                      border-white/[0.07]
                      bg-[#0b0f19]/70
                      p-5
                      transition-all
                      hover:border-white/[0.11]
                    "
                  >
                    <div
                      className="
                        pointer-events-none
                        absolute
                        -right-8
                        -top-8
                        h-24
                        w-24
                        rounded-full
                        bg-violet-500/[0.04]
                        blur-3xl
                      "
                    />

                    <div
                      className="
                        relative
                        flex
                        items-start
                        justify-between
                      "
                    >
                      <div
                        className="
                          flex
                          h-10
                          w-10
                          items-center
                          justify-center
                          rounded-xl
                          border
                          border-white/[0.07]
                          bg-black/20
                        "
                      >
                        <Icon
                          size={18}
                          className="
                            text-violet-300
                          "
                        />
                      </div>

                      <ArrowUpRight
                        size={15}
                        className="
                          text-slate-700
                          transition
                          group-hover:text-slate-400
                        "
                      />
                    </div>

                    <p
                      className="
                        mt-5
                        text-2xl
                        font-semibold
                        text-white
                      "
                    >
                      {
                        item.value
                      }
                    </p>

                    <p
                      className="
                        mt-1
                        text-sm
                        font-medium
                        text-slate-400
                      "
                    >
                      {
                        item.label
                      }
                    </p>

                    <p
                      className="
                        mt-2
                        text-[10px]
                        text-slate-700
                      "
                    >
                      {
                        item.detail
                      }
                    </p>
                  </div>
                );
              }
            )
          }
        </section>


        {/* MAIN WORKSPACE */}

        <section
          className="
            mt-6
            grid
            gap-6
            xl:grid-cols-[1.25fr_.75fr]
          "
        >

          {/* CANDIDATE EXPLORER */}

          <div
            className="
              rounded-2xl
              border
              border-white/[0.07]
              bg-[#0b0f19]/70
              p-5
              md:p-6
            "
          >
            <div
              className="
                flex
                flex-col
                gap-5
                lg:flex-row
                lg:items-end
                lg:justify-between
              "
            >
              <div>
                <div
                  className="
                    flex
                    items-center
                    gap-2
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.22em]
                    text-violet-300
                  "
                >
                  <Sparkles
                    size={13}
                  />

                  Candidate Explorer
                </div>

                <h2
                  className="
                    mt-3
                    text-xl
                    font-semibold
                    text-white
                  "
                >
                  Discover high-signal talent
                </h2>
              </div>


              <div
                className="
                  flex
                  gap-2
                "
              >
                <div
                  className="
                    relative
                    flex-1
                    lg:w-[250px]
                  "
                >
                  <Search
                    size={15}
                    className="
                      pointer-events-none
                      absolute
                      left-3
                      top-1/2
                      -translate-y-1/2
                      text-slate-600
                    "
                  />

                  <input
                    value={search}
                    onChange={
                      (
                        event
                      ) =>
                        setSearch(
                          event.target.value
                        )
                    }
                    placeholder="Search candidates"
                    className="
                      h-10
                      w-full
                      rounded-lg
                      border
                      border-white/[0.07]
                      bg-black/20
                      pl-9
                      pr-3
                      text-xs
                      text-slate-300
                      outline-none
                      placeholder:text-slate-700
                      focus:border-cyan-400/25
                    "
                  />
                </div>


                <div
                  className="
                    relative
                  "
                >
                  <button
                    type="button"
                    onClick={
                      () =>
                        setFilterOpen(
                          !filterOpen
                        )
                    }
                    className="
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-lg
                      border
                      border-white/[0.07]
                      bg-white/[0.015]
                      text-slate-500
                      transition
                      hover:border-white/[0.12]
                      hover:text-slate-300
                    "
                  >
                    <Filter
                      size={15}
                    />
                  </button>


                  {
                    filterOpen && (
                      <div
                        className="
                          absolute
                          right-0
                          top-12
                          z-30
                          w-44
                          rounded-xl
                          border
                          border-white/[0.08]
                          bg-[#0d111b]
                          p-2
                          shadow-2xl
                          shadow-black/40
                        "
                      >
                        {
                          (
                            [
                              "All",
                              "Strong Match",
                              "Recommended",
                              "Interview",
                              "Review",
                            ] as const
                          ).map(
                            (
                              status
                            ) => (
                              <button
                                key={
                                  status
                                }
                                type="button"
                                onClick={
                                  () => {
                                    setSelectedStatus(
                                      status
                                    );

                                    setFilterOpen(
                                      false
                                    );
                                  }
                                }
                                className={`
                                  flex
                                  w-full
                                  items-center
                                  rounded-lg
                                  px-3
                                  py-2.5
                                  text-left
                                  text-xs
                                  transition
                                  ${
                                    selectedStatus ===
                                    status
                                      ? `
                                        bg-violet-400/[0.08]
                                        text-violet-200
                                      `
                                      : `
                                        text-slate-500
                                        hover:bg-white/[0.04]
                                        hover:text-slate-300
                                      `
                                  }
                                `}
                              >
                                {
                                  status
                                }
                              </button>
                            )
                          )
                        }
                      </div>
                    )
                  }
                </div>
              </div>
            </div>


            <div
              className="
                mt-6
                space-y-3
              "
            >
              {
                filteredCandidates.length >
                0 ? (
                  filteredCandidates.map(
                    (
                      candidate
                    ) => (
                      <CandidateRow
                        key={
                          candidate.id
                        }
                        candidate={
                          candidate
                        }
                        onClick={
                          () =>
                            setSelectedCandidate(
                              candidate
                            )
                        }
                      />
                    )
                  )
                ) : (
                  <div
                    className="
                      rounded-xl
                      border
                      border-dashed
                      border-white/[0.08]
                      py-12
                      text-center
                    "
                  >
                    <Search
                      size={22}
                      className="
                        mx-auto
                        text-slate-700
                      "
                    />

                    <p
                      className="
                        mt-3
                        text-sm
                        text-slate-500
                      "
                    >
                      No candidates match this search.
                    </p>
                  </div>
                )
              }
            </div>
          </div>


          {/* RIGHT SIDE */}

          <div
            className="
              space-y-6
            "
          >

            {/* AI PRIORITY */}

            <div
              className="
                relative
                overflow-hidden
                rounded-2xl
                border
                border-violet-400/12
                bg-violet-400/[0.025]
                p-6
              "
            >
              <div
                className="
                  pointer-events-none
                  absolute
                  -right-14
                  -top-14
                  h-40
                  w-40
                  rounded-full
                  bg-violet-500/[0.08]
                  blur-[70px]
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
                    gap-2
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.2em]
                    text-violet-300
                  "
                >
                  <BrainCircuit
                    size={13}
                  />

                  AI Priority Signal
                </div>

                <h3
                  className="
                    mt-4
                    text-lg
                    font-semibold
                    text-white
                  "
                >
                  4 candidates deserve
                  immediate attention.
                </h3>

                <p
                  className="
                    mt-3
                    text-xs
                    leading-6
                    text-slate-500
                  "
                >
                  The current candidate pool contains four profiles
                  with strong role alignment and consistent interview
                  performance.
                </p>

                <button
                  type="button"
                  className="
                    mt-6
                    inline-flex
                    items-center
                    gap-2
                    text-xs
                    font-medium
                    text-violet-200
                    transition
                    hover:text-violet-100
                  "
                >
                  Review priority candidates

                  <ChevronRight
                    size={15}
                  />
                </button>
              </div>
            </div>


            {/* HIRING HEALTH */}

            <div
              className="
                rounded-2xl
                border
                border-white/[0.07]
                bg-[#0b0f19]/70
                p-6
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
                      tracking-[0.2em]
                      text-slate-500
                    "
                  >
                    Hiring health
                  </p>

                  <h3
                    className="
                      mt-3
                      text-lg
                      font-semibold
                      text-white
                    "
                  >
                    Pipeline quality
                  </h3>
                </div>

                <ShieldCheck
                  size={20}
                  className="
                    text-cyan-300
                  "
                />
              </div>


              <div
                className="
                  mt-6
                  space-y-4
                "
              >
                <HealthRow
                  label="Candidate quality"
                  value="82%"
                  width={82}
                  color="cyan"
                />

                <HealthRow
                  label="Interview readiness"
                  value="74%"
                  width={74}
                  color="violet"
                />

                <HealthRow
                  label="Role alignment"
                  value="88%"
                  width={88}
                  color="emerald"
                />
              </div>


              <div
                className="
                  mt-6
                  rounded-xl
                  border
                  border-white/[0.05]
                  bg-white/[0.015]
                  p-4
                "
              >
                <div
                  className="
                    flex
                    items-start
                    gap-3
                  "
                >
                  <Target
                    size={16}
                    className="
                      mt-0.5
                      text-amber-300
                    "
                  />

                  <p
                    className="
                      text-xs
                      leading-6
                      text-slate-600
                    "
                  >
                    Communication quality is currently the weakest
                    shared signal across shortlisted candidates.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ACTIVITY */}

        <section
          className="
            mt-6
            grid
            gap-6
            xl:grid-cols-[1.1fr_.9fr]
          "
        >

          <div
            className="
              rounded-2xl
              border
              border-white/[0.07]
              bg-[#0b0f19]/60
              p-5
              md:p-6
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
                <div
                  className="
                    flex
                    items-center
                    gap-2
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.22em]
                    text-cyan-300
                  "
                >
                  <Clock3
                    size={13}
                  />

                  Recent activity
                </div>

                <h2
                  className="
                    mt-3
                    text-lg
                    font-semibold
                    text-white
                  "
                >
                  Pipeline movement
                </h2>
              </div>
            </div>


            <div
              className="
                mt-6
                space-y-5
              "
            >
              <ActivityRow
                title="Candidate completed AI interview"
                detail="Rohan Kapoor · AI Engineer"
                time="12 min ago"
              />

              <ActivityRow
                title="New high-match profile discovered"
                detail="Arjun Mehta · 94% role alignment"
                time="38 min ago"
              />

              <ActivityRow
                title="Candidate moved to review stage"
                detail="Ananya Verma · Backend Engineer"
                time="2 hrs ago"
              />
            </div>
          </div>


          <div
            className="
              rounded-2xl
              border
              border-white/[0.07]
              bg-[#0b0f19]/60
              p-5
              md:p-6
            "
          >
            <div
              className="
                flex
                items-center
                gap-2
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.22em]
                text-violet-300
              "
            >
              <FileSearch
                size={13}
              />

              Quick actions
            </div>

            <div
              className="
                mt-6
                grid
                gap-3
              "
            >
              <QuickAction
                icon={Users}
                title="Explore candidates"
                description="Search across the talent pool"
              />

              <QuickAction
                icon={BrainCircuit}
                title="Review interview insights"
                description="Inspect AI-generated signals"
              />

              <QuickAction
                icon={Zap}
                title="Compare top candidates"
                description="Identify the strongest role fit"
              />
            </div>
          </div>
        </section>
      </div>


      {/* CANDIDATE DRAWER */}

      {
        selectedCandidate && (
          <div
            className="
              fixed
              inset-0
              z-[80]
              flex
              justify-end
              bg-black/45
              backdrop-blur-[2px]
            "
            onClick={
              () =>
                setSelectedCandidate(
                  null
                )
            }
          >
            <aside
              className="
                h-full
                w-full
                max-w-md
                overflow-y-auto
                border-l
                border-white/[0.08]
                bg-[#0b0f19]
                p-6
                shadow-2xl
                shadow-black/50
              "
              onClick={
                (
                  event
                ) =>
                  event.stopPropagation()
              }
            >
              <div
                className="
                  flex
                  items-center
                  justify-between
                "
              >
                <p
                  className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.22em]
                    text-violet-300
                  "
                >
                  Candidate profile
                </p>

                <button
                  type="button"
                  onClick={
                    () =>
                      setSelectedCandidate(
                        null
                      )
                  }
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-lg
                    border
                    border-white/[0.07]
                    text-slate-500
                    transition
                    hover:text-slate-200
                  "
                >
                  <X
                    size={16}
                  />
                </button>
              </div>


              <div
                className="
                  mt-8
                  flex
                  items-center
                  gap-4
                "
              >
                <div
                  className="
                    flex
                    h-16
                    w-16
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-violet-400/15
                    bg-violet-400/[0.06]
                    text-lg
                    font-semibold
                    text-violet-200
                  "
                >
                  {
                    selectedCandidate.initials
                  }
                </div>

                <div>
                  <h2
                    className="
                      text-xl
                      font-semibold
                      text-white
                    "
                  >
                    {
                      selectedCandidate.name
                    }
                  </h2>

                  <p
                    className="
                      mt-1
                      text-sm
                      text-slate-500
                    "
                  >
                    {
                      selectedCandidate.role
                    }
                  </p>
                </div>
              </div>


              <div
                className="
                  mt-8
                  grid
                  grid-cols-2
                  gap-3
                "
              >
                <DrawerMetric
                  label="Role match"
                  value={`${selectedCandidate.match}%`}
                />

                <DrawerMetric
                  label="AI score"
                  value={`${selectedCandidate.score}%`}
                />

                <DrawerMetric
                  label="Experience"
                  value={selectedCandidate.experience}
                />

                <DrawerMetric
                  label="Status"
                  value={selectedCandidate.status}
                />
              </div>


              <div
                className="
                  mt-8
                "
              >
                <p
                  className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.18em]
                    text-slate-600
                  "
                >
                  Core skills
                </p>

                <div
                  className="
                    mt-3
                    flex
                    flex-wrap
                    gap-2
                  "
                >
                  {
                    selectedCandidate.skills.map(
                      (
                        skill
                      ) => (
                        <span
                          key={skill}
                          className="
                            rounded-lg
                            border
                            border-white/[0.07]
                            bg-white/[0.02]
                            px-3
                            py-2
                            text-xs
                            text-slate-400
                          "
                        >
                          {skill}
                        </span>
                      )
                    )
                  }
                </div>
              </div>


              <div
                className="
                  mt-8
                  rounded-xl
                  border
                  border-cyan-400/10
                  bg-cyan-400/[0.03]
                  p-4
                "
              >
                <div
                  className="
                    flex
                    items-start
                    gap-3
                  "
                >
                  <Sparkles
                    size={16}
                    className="
                      mt-0.5
                      text-cyan-300
                    "
                  />

                  <p
                    className="
                      text-xs
                      leading-6
                      text-slate-500
                    "
                  >
                    AI analysis indicates strong alignment with the
                    selected role and consistent technical performance.
                  </p>
                </div>
              </div>


              <button
                type="button"
                className="
                  mt-8
                  flex
                  h-11
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-violet-400/25
                  bg-violet-400/[0.08]
                  text-sm
                  font-semibold
                  text-violet-100
                  transition
                  hover:bg-violet-400/[0.13]
                "
              >
                Open full intelligence

                <ChevronRight
                  size={16}
                />
              </button>
            </aside>
          </div>
        )
      }
    </div>
  );
}


function HeroMetric(
  {
    label,
    value,
  }: {
    label: string;
    value: string;
  }
) {
  return (
    <div
      className="
        min-w-[105px]
        rounded-xl
        border
        border-white/[0.07]
        bg-black/20
        px-4
        py-4
      "
    >
      <p
        className="
          text-xl
          font-semibold
          text-white
        "
      >
        {value}
      </p>

      <p
        className="
          mt-1
          text-[9px]
          font-semibold
          uppercase
          tracking-[0.13em]
          text-slate-600
        "
      >
        {label}
      </p>
    </div>
  );
}


function CandidateRow(
  {
    candidate,
    onClick,
  }: {
    candidate: Candidate;
    onClick: () => void;
  }
) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group
        flex
        w-full
        flex-col
        gap-4
        rounded-xl
        border
        border-white/[0.06]
        bg-white/[0.015]
        p-4
        text-left
        transition-all
        hover:border-white/[0.11]
        hover:bg-white/[0.025]
        sm:flex-row
        sm:items-center
      "
    >
      <div
        className="
          flex
          h-11
          w-11
          shrink-0
          items-center
          justify-center
          rounded-xl
          border
          border-white/[0.07]
          bg-black/20
          text-xs
          font-semibold
          text-violet-200
        "
      >
        {
          candidate.initials
        }
      </div>


      <div
        className="
          min-w-0
          flex-1
        "
      >
        <div
          className="
            flex
            flex-wrap
            items-center
            gap-2
          "
        >
          <p
            className="
              text-sm
              font-medium
              text-slate-200
            "
          >
            {
              candidate.name
            }
          </p>

          <span
            className={`
              rounded-md
              border
              px-2
              py-1
              text-[9px]
              font-medium
              ${statusStyles[candidate.status]}
            `}
          >
            {
              candidate.status
            }
          </span>
        </div>

        <p
          className="
            mt-1
            text-xs
            text-slate-600
          "
        >
          {
            candidate.role
          }
          {" · "}
          {
            candidate.experience
          }
        </p>

        <div
          className="
            mt-3
            flex
            flex-wrap
            gap-2
          "
        >
          {
            candidate.skills.map(
              (
                skill
              ) => (
                <span
                  key={skill}
                  className="
                    text-[10px]
                    text-slate-700
                  "
                >
                  {skill}
                </span>
              )
            )
          }
        </div>
      </div>


      <div
        className="
          flex
          items-center
          gap-5
          sm:ml-auto
        "
      >
        <div>
          <p
            className="
              text-[9px]
              uppercase
              tracking-[0.12em]
              text-slate-700
            "
          >
            Match
          </p>

          <p
            className="
              mt-1
              text-lg
              font-semibold
              text-cyan-300
            "
          >
            {
              candidate.match
            }
            %
          </p>
        </div>

        <ChevronRight
          size={17}
          className="
            text-slate-700
            transition-transform
            group-hover:translate-x-1
          "
        />
      </div>
    </button>
  );
}


function HealthRow(
  {
    label,
    value,
    width,
    color,
  }: {
    label: string;
    value: string;
    width: number;
    color:
      | "cyan"
      | "violet"
      | "emerald";
  }
) {
  const colors = {
    cyan:
      "from-cyan-500/60 to-sky-400/80",

    violet:
      "from-violet-500/60 to-fuchsia-400/80",

    emerald:
      "from-emerald-500/60 to-teal-400/80",
  };


  return (
    <div>
      <div
        className="
          flex
          items-center
          justify-between
        "
      >
        <span
          className="
            text-xs
            text-slate-500
          "
        >
          {label}
        </span>

        <span
          className="
            text-xs
            font-medium
            text-slate-300
          "
        >
          {value}
        </span>
      </div>

      <div
        className="
          mt-2
          h-1.5
          overflow-hidden
          rounded-full
          bg-white/[0.04]
        "
      >
        <div
          className={`
            h-full
            rounded-full
            bg-gradient-to-r
            ${colors[color]}
          `}
          style={{
            width:
              `${width}%`,
          }}
        />
      </div>
    </div>
  );
}


function ActivityRow(
  {
    title,
    detail,
    time,
  }: {
    title: string;
    detail: string;
    time: string;
  }
) {
  return (
    <div
      className="
        flex
        items-start
        gap-4
      "
    >
      <div
        className="
          mt-1.5
          h-2
          w-2
          shrink-0
          rounded-full
          bg-cyan-300
          shadow-[0_0_12px_rgba(103,232,249,0.8)]
        "
      />

      <div
        className="
          min-w-0
          flex-1
        "
      >
        <div
          className="
            flex
            flex-col
            gap-1
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <p
            className="
              text-sm
              font-medium
              text-slate-300
            "
          >
            {title}
          </p>

          <span
            className="
              text-[10px]
              text-slate-700
            "
          >
            {time}
          </span>
        </div>

        <p
          className="
            mt-1
            text-xs
            text-slate-600
          "
        >
          {detail}
        </p>
      </div>
    </div>
  );
}


function QuickAction(
  {
    icon: Icon,
    title,
    description,
  }: {
    icon: typeof Users;
    title: string;
    description: string;
  }
) {
  return (
    <button
      type="button"
      className="
        group
        flex
        items-center
        gap-4
        rounded-xl
        border
        border-white/[0.06]
        bg-white/[0.015]
        p-4
        text-left
        transition
        hover:border-white/[0.11]
        hover:bg-white/[0.025]
      "
    >
      <div
        className="
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-lg
          border
          border-white/[0.07]
          bg-black/20
        "
      >
        <Icon
          size={17}
          className="
            text-violet-300
          "
        />
      </div>

      <div
        className="
          min-w-0
          flex-1
        "
      >
        <p
          className="
            text-sm
            font-medium
            text-slate-300
          "
        >
          {title}
        </p>

        <p
          className="
            mt-1
            text-xs
            text-slate-600
          "
        >
          {description}
        </p>
      </div>

      <ChevronRight
        size={16}
        className="
          text-slate-700
          transition-transform
          group-hover:translate-x-1
        "
      />
    </button>
  );
}


function DrawerMetric(
  {
    label,
    value,
  }: {
    label: string;
    value: string;
  }
) {
  return (
    <div
      className="
        rounded-xl
        border
        border-white/[0.06]
        bg-white/[0.015]
        p-4
      "
    >
      <p
        className="
          text-[9px]
          font-semibold
          uppercase
          tracking-[0.15em]
          text-slate-700
        "
      >
        {label}
      </p>

      <p
        className="
          mt-3
          text-sm
          font-medium
          text-slate-300
        "
      >
        {value}
      </p>
    </div>
  );
}


export default RecruiterDashboard;