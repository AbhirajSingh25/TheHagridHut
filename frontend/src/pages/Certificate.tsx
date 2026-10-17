import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Award,
  BadgeCheck,
  Brain,
  CheckCircle2,
  Download,
  FileCheck2,
  LoaderCircle,
  Printer,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trophy,
  Zap,
} from "lucide-react";

import {
  downloadCertificate,
  getLatestReport,
} from "../services/api";


type Report = {
  role?: string;
  level?: string;
  overall_score?: number | string;
  score?: number | string;
  created_at?: string;
  date?: string;
  candidate_name?: string;
  candidateName?: string;
  [key: string]: unknown;
};


function getStoredCandidateName() {

  const candidates = [
    "hiresense_profile",
    "user",
    "hiresense_user",
  ];


  for (
    const key of candidates
  ) {

    try {

      const value =
        localStorage.getItem(
          key
        );


      if (!value) {
        continue;
      }


      const parsed =
        JSON.parse(
          value
        );


      const name =
        parsed?.name ??
        parsed?.fullName ??
        parsed?.username;


      if (
        typeof name ===
        "string" &&
        name.trim()
      ) {

        return name.trim();

      }

    } catch {
      // Ignore malformed local storage values.
    }

  }


  return "Candidate";

}


function toScore(
  value: unknown
) {

  const score =
    Number(value);


  return Number.isFinite(
    score
  )
    ? Math.max(
        0,
        Math.min(
          100,
          score
        )
      )
    : 0;

}


function formatDate(
  value?: string
) {

  if (!value) {

    return new Intl.DateTimeFormat(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    ).format(
      new Date()
    );

  }


  const date =
    new Date(
      value
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return value;

  }


  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  ).format(
    date
  );

}


function Certificate() {

  const [
    report,
    setReport,
  ] = useState<Report | null>(
    null
  );


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    refreshing,
    setRefreshing,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  async function loadCertificate(
    isRefresh = false
  ) {

    try {

      setError("");

      if (isRefresh) {

        setRefreshing(true);

      } else {

        setLoading(true);

      }


      const data =
        await getLatestReport();


      setReport(
        data || null
      );

    } catch (requestError) {

      console.error(
        "Certificate loading error:",
        requestError
      );


      setReport(
        null
      );

      setError(
        "A verified interview report is not available yet."
      );

    } finally {

      setLoading(false);

      setRefreshing(false);

    }

  }


  useEffect(() => {

    loadCertificate();

  }, []);


  const certificate =
    useMemo(
      () => {

        const candidateName =
          report?.candidate_name ??
          report?.candidateName ??
          getStoredCandidateName();


        const score =
          toScore(
            report?.overall_score ??
            report?.score
          );


        const role =
          String(
            report?.role ||
            "AI Interview"
          );


        const level =
          String(
            report?.level ||
            "Professional"
          );


        const issueDate =
          formatDate(
            String(
              report?.created_at ??
              report?.date ??
              ""
            )
          );


        const certificateId =
          `HSAI-${
            role
              .replace(
                /[^a-z0-9]/gi,
                ""
              )
              .slice(
                0,
                6
              )
              .toUpperCase() ||
            "CERT"
          }-${
            Math.round(
              score
            )
          }`;


        return {
          candidateName,
          score,
          role,
          level,
          issueDate,
          certificateId,
        };

      },
      [
        report,
      ]
    );


  const handleDownload =
    () => {

      downloadCertificate(
        certificate.candidateName,
        certificate.score
      );

    };


  const handlePrint =
    () => {

      window.print();

    };


  if (loading) {

    return (

      <div
        className="
          flex
          min-h-[72vh]
          flex-col
          items-center
          justify-center
          gap-5
        "
      >

        <div
          className="
            flex
            h-20
            w-20
            items-center
            justify-center
            rounded-[28px]
            border
            border-cyan-400/15
            bg-cyan-400/[0.05]
            shadow-[0_0_60px_rgba(34,211,238,0.08)]
          "
        >

          <LoaderCircle
            size={30}
            className="
              animate-spin
              text-cyan-300
            "
          />

        </div>


        <div
          className="
            text-center
          "
        >

          <p
            className="
              text-sm
              font-semibold
              text-slate-200
            "
          >
            Preparing your certificate

          </p>

          <p
            className="
              mt-2
              text-xs
              text-slate-600
            "
          >
            Validating your latest interview performance...

          </p>

        </div>

      </div>

    );

  }


  if (!report) {

    return (

      <div
        className="
          min-h-full
          px-4
          py-5
          pb-12
          md:px-6
          lg:px-8
          xl:px-10
        "
      >

        <div
          className="
            mx-auto
            max-w-[1100px]
          "
        >

          <section
            className="
              relative
              overflow-hidden
              rounded-[30px]
              border
              border-white/[0.07]
              bg-[#0b0f19]/80
              px-6
              py-10
              text-center
              backdrop-blur-xl
              md:px-12
              md:py-16
            "
          >

            <div
              className="
                pointer-events-none
                absolute
                left-1/2
                top-1/2
                h-72
                w-72
                -translate-x-1/2
                -translate-y-1/2
                rounded-full
                bg-violet-500/[0.08]
                blur-[120px]
              "
            />


            <div
              className="
                relative
                mx-auto
                max-w-xl
              "
            >

              <div
                className="
                  mx-auto
                  flex
                  h-20
                  w-20
                  items-center
                  justify-center
                  rounded-[26px]
                  border
                  border-violet-400/15
                  bg-violet-500/[0.07]
                "
              >

                <Award
                  size={32}
                  className="
                    text-violet-300
                  "
                />

              </div>


              <div
                className="
                  mt-7
                  flex
                  items-center
                  justify-center
                  gap-2
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.20em]
                  text-violet-300
                "
              >

                <ShieldCheck
                  size={13}
                />

                Verified Credentials

              </div>


              <h1
                className="
                  mt-4
                  text-3xl
                  font-semibold
                  tracking-tight
                  text-white
                  md:text-5xl
                "
              >
                Your certificate will appear
                {" "}
                <span
                  className="
                    bg-gradient-to-r
                    from-violet-300
                    via-cyan-300
                    to-emerald-300
                    bg-clip-text
                    text-transparent
                  "
                >
                  after your first verified report.
                </span>

              </h1>


              <p
                className="
                  mt-5
                  text-sm
                  leading-7
                  text-slate-500
                "
              >
                Complete a Hagrid's Hut interview and generate a final
                performance report. Once the report is available, this
                page will create your verified interview credential.

              </p>


              {error && (

                <div
                  className="
                    mx-auto
                    mt-6
                    max-w-lg
                    rounded-2xl
                    border
                    border-amber-400/15
                    bg-amber-400/[0.04]
                    px-4
                    py-3
                    text-xs
                    leading-6
                    text-slate-500
                  "
                >
                  {error}

                </div>

              )}


              <button
                onClick={() =>
                  loadCertificate(
                    true
                  )
                }
                disabled={refreshing}
                className="
                  mt-8
                  inline-flex
                  h-12
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-violet-400/20
                  bg-violet-500/[0.08]
                  px-5
                  text-sm
                  font-medium
                  text-violet-200
                  transition
                  hover:bg-violet-500/[0.14]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >

                <RefreshCw
                  size={16}
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />

                {
                  refreshing
                    ? "Checking report"
                    : "Check again"
                }

              </button>

            </div>

          </section>

        </div>

      </div>

    );

  }


  return (

    <div
      className="
        min-h-full
        px-4
        py-5
        pb-12
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

        {/* =================================================
            PAGE HEADER
            ================================================= */}

        <section
          className="
            relative
            overflow-hidden
            rounded-[28px]
            border
            border-white/[0.07]
            bg-[#0b0f19]/75
            px-5
            py-7
            backdrop-blur-xl
            md:px-8
            md:py-9
          "
        >

          <div
            className="
              pointer-events-none
              absolute
              -right-20
              -top-24
              h-72
              w-72
              rounded-full
              bg-violet-500/[0.10]
              blur-[110px]
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              bottom-[-120px]
              left-[42%]
              h-60
              w-60
              rounded-full
              bg-cyan-400/[0.06]
              blur-[100px]
            "
          />


          <div
            className="
              relative
              flex
              flex-col
              gap-7
              xl:flex-row
              xl:items-end
              xl:justify-between
            "
          >

            <div
              className="
                max-w-3xl
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
                  text-cyan-300
                "
              >

                <FileCheck2
                  size={13}
                />

                Interview Credential

              </div>


              <h1
                className="
                  mt-4
                  text-3xl
                  font-semibold
                  tracking-tight
                  text-white
                  md:text-5xl
                "
              >
                A record of your
                {" "}
                <span
                  className="
                    bg-gradient-to-r
                    from-violet-300
                    via-cyan-300
                    to-emerald-300
                    bg-clip-text
                    text-transparent
                  "
                >
                  verified performance.
                </span>

              </h1>


              <p
                className="
                  mt-4
                  max-w-2xl
                  text-sm
                  leading-7
                  text-slate-500
                "
              >
                This certificate is generated from your latest completed
                Hagrid's Hut interview report and reflects the role,
                interview level, and overall performance recorded by
                the system.

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

              <button
                onClick={() =>
                  loadCertificate(
                    true
                  )
                }
                disabled={refreshing}
                className="
                  inline-flex
                  h-11
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-white/[0.07]
                  bg-white/[0.025]
                  px-4
                  text-xs
                  font-medium
                  text-slate-400
                  transition
                  hover:border-cyan-400/20
                  hover:bg-cyan-400/[0.05]
                  hover:text-cyan-100
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >

                <RefreshCw
                  size={15}
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />

                Refresh

              </button>


              <button
                onClick={
                  handlePrint
                }
                className="
                  inline-flex
                  h-11
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-white/[0.07]
                  bg-white/[0.025]
                  px-4
                  text-xs
                  font-medium
                  text-slate-400
                  transition
                  hover:border-white/[0.12]
                  hover:bg-white/[0.05]
                  hover:text-white
                "
              >

                <Printer
                  size={15}
                />

                Print

              </button>


              <button
                onClick={
                  handleDownload
                }
                className="
                  inline-flex
                  h-11
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-violet-400/20
                  bg-gradient-to-r
                  from-violet-500/[0.14]
                  to-cyan-400/[0.10]
                  px-4
                  text-xs
                  font-semibold
                  text-violet-100
                  shadow-[0_0_30px_rgba(139,92,246,0.08)]
                  transition
                  hover:border-violet-300/35
                  hover:from-violet-500/[0.22]
                  hover:to-cyan-400/[0.16]
                "
              >

                <Download
                  size={15}
                />

                Download certificate

              </button>

            </div>

          </div>

        </section>


        {/* =================================================
            CERTIFICATE + SIDEBAR
            ================================================= */}

        <section
          className="
            mt-8
            grid
            gap-6
            xl:grid-cols-[minmax(0,1fr)_320px]
            xl:items-start
          "
        >

          {/* =============================================
              CERTIFICATE
              ============================================= */}

          <div
            className="
              relative
              overflow-hidden
              rounded-[30px]
              border
              border-violet-400/20
              bg-[#090c15]
              p-3
              shadow-[0_28px_90px_rgba(0,0,0,0.35)]
            "
          >

            <div
              className="
                relative
                overflow-hidden
                rounded-[22px]
                border
                border-white/[0.07]
                bg-[radial-gradient(circle_at_50%_-20%,rgba(139,92,246,0.15),transparent_34%),radial-gradient(circle_at_15%_100%,rgba(34,211,238,0.07),transparent_28%),linear-gradient(135deg,#0d1220_0%,#080b12_52%,#0d1020_100%)]
                px-6
                py-8
                sm:px-10
                sm:py-12
                lg:px-16
                lg:py-16
              "
            >

              <div
                className="
                  pointer-events-none
                  absolute
                  left-6
                  top-6
                  h-16
                  w-16
                  border-l
                  border-t
                  border-violet-400/35
                "
              />

              <div
                className="
                  pointer-events-none
                  absolute
                  right-6
                  top-6
                  h-16
                  w-16
                  border-r
                  border-t
                  border-cyan-400/30
                "
              />

              <div
                className="
                  pointer-events-none
                  absolute
                  bottom-6
                  left-6
                  h-16
                  w-16
                  border-b
                  border-l
                  border-cyan-400/30
                "
              />

              <div
                className="
                  pointer-events-none
                  absolute
                  bottom-6
                  right-6
                  h-16
                  w-16
                  border-b
                  border-r
                  border-violet-400/35
                "
              />


              <div
                className="
                  relative
                  mx-auto
                  max-w-3xl
                  text-center
                "
              >

                <div
                  className="
                    flex
                    items-center
                    justify-center
                    gap-3
                  "
                >

                  <div
                    className="
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-2xl
                      border
                      border-violet-400/20
                      bg-violet-500/[0.08]
                    "
                  >

                    <Brain
                      size={22}
                      className="
                        text-violet-300
                      "
                    />

                  </div>


                  <div
                    className="
                      text-left
                    "
                  >

                    <p
                      className="
                        text-sm
                        font-semibold
                        tracking-tight
                        text-white
                      "
                    >
                      HireSense
                      {" "}
                      <span
                        className="
                          text-violet-300
                        "
                      >
                        AI
                      </span>

                    </p>

                    <p
                      className="
                        mt-0.5
                        text-[9px]
                        font-semibold
                        uppercase
                        tracking-[0.18em]
                        text-slate-600
                      "
                    >
                      Career Intelligence

                    </p>

                  </div>

                </div>


                <div
                  className="
                    mx-auto
                    mt-10
                    flex
                    h-20
                    w-20
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-amber-300/25
                    bg-amber-400/[0.08]
                    shadow-[0_0_45px_rgba(251,191,36,0.08)]
                  "
                >

                  <Award
                    size={34}
                    className="
                      text-amber-200
                    "
                  />

                </div>


                <p
                  className="
                    mt-7
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.34em]
                    text-cyan-300
                  "
                >
                  Certificate of Interview Excellence

                </p>


                <h2
                  className="
                    mt-6
                    text-sm
                    font-medium
                    text-slate-500
                  "
                >
                  This is to certify that

                </h2>


                <div
                  className="
                    mt-4
                    bg-gradient-to-r
                    from-violet-200
                    via-white
                    to-cyan-200
                    bg-clip-text
                    text-4xl
                    font-semibold
                    tracking-tight
                    text-transparent
                    sm:text-5xl
                  "
                >
                  {certificate.candidateName}

                </div>


                <p
                  className="
                    mx-auto
                    mt-7
                    max-w-2xl
                    text-sm
                    leading-7
                    text-slate-400
                  "
                >
                  has successfully completed an AI-powered interview
                  assessment for the role of
                  {" "}
                  <span
                    className="
                      font-semibold
                      text-slate-200
                    "
                  >
                    {certificate.role}
                  </span>
                  {" "}
                  at
                  {" "}
                  <span
                    className="
                      font-semibold
                      text-slate-200
                    "
                  >
                    {certificate.level}
                  </span>
                  {" "}
                  level and demonstrated verified performance through
                  the Hagrid's Hut interview intelligence system.

                </p>


                <div
                  className="
                    mx-auto
                    mt-10
                    grid
                    max-w-xl
                    gap-3
                    sm:grid-cols-3
                  "
                >

                  <div
                    className="
                      rounded-2xl
                      border
                      border-white/[0.06]
                      bg-black/[0.14]
                      p-4
                    "
                  >

                    <Target
                      size={16}
                      className="
                        mx-auto
                        text-cyan-300
                      "
                    />

                    <p
                      className="
                        mt-3
                        text-[9px]
                        font-semibold
                        uppercase
                        tracking-[0.14em]
                        text-slate-700
                      "
                    >
                      Role

                    </p>

                    <p
                      className="
                        mt-2
                        truncate
                        text-sm
                        font-medium
                        text-slate-200
                      "
                    >
                      {certificate.role}

                    </p>

                  </div>


                  <div
                    className="
                      rounded-2xl
                      border
                      border-violet-400/15
                      bg-violet-500/[0.045]
                      p-4
                    "
                  >

                    <Trophy
                      size={16}
                      className="
                        mx-auto
                        text-violet-300
                      "
                    />

                    <p
                      className="
                        mt-3
                        text-[9px]
                        font-semibold
                        uppercase
                        tracking-[0.14em]
                        text-slate-700
                      "
                    >
                      Overall score

                    </p>

                    <p
                      className="
                        mt-2
                        text-2xl
                        font-semibold
                        text-white
                      "
                    >
                      {certificate.score.toFixed(1)}%

                    </p>

                  </div>


                  <div
                    className="
                      rounded-2xl
                      border
                      border-emerald-400/15
                      bg-emerald-400/[0.045]
                      p-4
                    "
                  >

                    <ShieldCheck
                      size={16}
                      className="
                        mx-auto
                        text-emerald-300
                      "
                    />

                    <p
                      className="
                        mt-3
                        text-[9px]
                        font-semibold
                        uppercase
                        tracking-[0.14em]
                        text-slate-700
                      "
                    >
                      Status

                    </p>

                    <p
                      className="
                        mt-2
                        text-sm
                        font-medium
                        text-emerald-200
                      "
                    >
                      Verified

                    </p>

                  </div>

                </div>


                <div
                  className="
                    mt-12
                    flex
                    flex-col
                    gap-6
                    border-t
                    border-white/[0.06]
                    pt-7
                    sm:flex-row
                    sm:items-end
                    sm:justify-between
                    sm:text-left
                  "
                >

                  <div
                    className="
                      text-center
                      sm:text-left
                    "
                  >

                    <div
                      className="
                        mx-auto
                        h-px
                        w-32
                        bg-gradient-to-r
                        from-transparent
                        via-cyan-300/70
                        to-transparent
                        sm:mx-0
                      "
                    />

                    <p
                      className="
                        mt-3
                        text-xs
                        font-medium
                        text-slate-300
                      "
                    >
                      Hagrid's Hut · The Sorted Club

                    </p>

                    <p
                      className="
                        mt-1
                        text-[10px]
                        text-slate-700
                      "
                    >
                      Verified performance record

                    </p>

                  </div>


                  <div
                    className="
                      text-center
                      sm:text-right
                    "
                  >

                    <p
                      className="
                        text-[9px]
                        font-semibold
                        uppercase
                        tracking-[0.16em]
                        text-slate-700
                      "
                    >
                      Issued

                    </p>

                    <p
                      className="
                        mt-2
                        text-xs
                        font-medium
                        text-slate-300
                      "
                    >
                      {certificate.issueDate}

                    </p>


                    <p
                      className="
                        mt-3
                        font-mono
                        text-[9px]
                        tracking-wider
                        text-slate-700
                      "
                    >
                      {certificate.certificateId}

                    </p>

                  </div>

                </div>


                <div
                  className="
                    mt-8
                    flex
                    items-center
                    justify-center
                    gap-2
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.16em]
                    text-slate-700
                  "
                >

                  <BadgeCheck
                    size={13}
                    className="
                      text-emerald-400
                    "
                  />

                  Generated from verified interview intelligence

                </div>

              </div>

            </div>

          </div>


          {/* =============================================
              INTELLIGENCE SIDEBAR
              ============================================= */}

          <aside
            className="
              space-y-5
            "
          >

            <section
              className="
                rounded-[24px]
                border
                border-white/[0.06]
                bg-white/[0.02]
                p-5
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
                  tracking-[0.16em]
                  text-cyan-300
                "
              >

                <Sparkles
                  size={13}
                />

                Credential signal

              </div>


              <div
                className="
                  mt-5
                  flex
                  items-end
                  justify-between
                "
              >

                <div>

                  <p
                    className="
                      text-4xl
                      font-semibold
                      tracking-tight
                      text-white
                    "
                  >
                    {certificate.score.toFixed(1)}

                    <span
                      className="
                        ml-1
                        text-lg
                        text-slate-600
                      "
                    >
                      /100

                    </span>

                  </p>

                  <p
                    className="
                      mt-2
                      text-xs
                      text-slate-600
                    "
                  >
                    Latest interview result

                  </p>

                </div>


                <div
                  className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-violet-400/15
                    bg-violet-500/[0.07]
                  "
                >

                  <Star
                    size={21}
                    className="
                      text-violet-300
                    "
                  />

                </div>

              </div>

            </section>


            <section
              className="
                rounded-[24px]
                border
                border-white/[0.06]
                bg-white/[0.02]
                p-5
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >

                <CheckCircle2
                  size={16}
                  className="
                    text-emerald-300
                  "
                />

                <h3
                  className="
                    text-sm
                    font-semibold
                    text-slate-200
                  "
                >
                  Verification details

                </h3>

              </div>


              <div
                className="
                  mt-5
                  space-y-4
                "
              >

                {
                  [
                    [
                      "Interview role",
                      certificate.role,
                    ],
                    [
                      "Experience level",
                      certificate.level,
                    ],
                    [
                      "Issue date",
                      certificate.issueDate,
                    ],
                    [
                      "Credential ID",
                      certificate.certificateId,
                    ],
                  ].map(
                    (
                      [
                        label,
                        value,
                      ]
                    ) => (

                      <div
                        key={
                          label
                        }
                        className="
                          flex
                          items-start
                          justify-between
                          gap-4
                        "
                      >

                        <span
                          className="
                            text-xs
                            text-slate-600
                          "
                        >
                          {label}

                        </span>


                        <span
                          className="
                            max-w-[170px]
                            break-words
                            text-right
                            text-xs
                            font-medium
                            text-slate-300
                          "
                        >
                          {value}

                        </span>

                      </div>

                    )
                  )
                }

              </div>

            </section>


            <section
              className="
                relative
                overflow-hidden
                rounded-[24px]
                border
                border-violet-400/15
                bg-gradient-to-br
                from-violet-500/[0.08]
                to-cyan-400/[0.035]
                p-5
              "
            >

              <div
                className="
                  pointer-events-none
                  absolute
                  -right-10
                  -top-10
                  h-28
                  w-28
                  rounded-full
                  bg-violet-400/[0.10]
                  blur-3xl
                "
              />

              <div
                className="
                  relative
                "
              >

                <Award
                  size={19}
                  className="
                    text-violet-300
                  "
                />

                <h3
                  className="
                    mt-4
                    text-sm
                    font-semibold
                    text-white
                  "
                >
                  Shareable credential

                </h3>

                <p
                  className="
                    mt-2
                    text-xs
                    leading-6
                    text-slate-500
                  "
                >
                  Download the certificate as a record of your verified
                  Hagrid's Hut interview performance.

                </p>

                <button
                  onClick={
                    handleDownload
                  }
                  className="
                    mt-5
                    inline-flex
                    items-center
                    gap-2
                    text-xs
                    font-semibold
                    text-violet-200
                    transition
                    hover:text-white
                  "
                >

                  <Download
                    size={14}
                  />

                  Download PDF

                </button>

              </div>

            </section>

          </aside>

        </section>


        <section
          className="
            mt-6
            flex
            flex-col
            gap-4
            rounded-2xl
            border
            border-white/[0.055]
            bg-white/[0.018]
            p-5
            md:flex-row
            md:items-center
            md:justify-between
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
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                border
                border-emerald-400/15
                bg-emerald-400/[0.045]
              "
            >

              <ShieldCheck
                size={18}
                className="
                  text-emerald-300
                "
              />

            </div>


            <div>

              <p
                className="
                  text-sm
                  font-medium
                  text-slate-300
                "
              >
                Certificate data is tied to your latest report

              </p>

              <p
                className="
                  mt-1
                  text-xs
                  text-slate-600
                "
              >
                Completing a stronger interview can update the latest
                performance credential.

              </p>

            </div>

          </div>


          <div
            className="
              inline-flex
              items-center
              gap-2
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.14em]
              text-slate-600
            "
          >

            <span
              className="
                h-1.5
                w-1.5
                rounded-full
                bg-emerald-400
                shadow-[0_0_12px_rgba(52,211,153,0.9)]
              "
            />

            Verification active

          </div>

        </section>

      </div>

    </div>

  );

}


export default Certificate;