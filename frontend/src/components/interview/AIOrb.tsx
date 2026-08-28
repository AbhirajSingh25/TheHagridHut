import { motion } from "framer-motion";

type Props = {
  listening: boolean;
  processing?: boolean;
  audioLevel?: number;
};

export default function AIOrb({
  listening,
  processing = false,
  audioLevel = 0,
}: Props) {
  const intensity =
    listening
      ? Math.min(
          1,
          0.35 + audioLevel * 1.7
        )
      : processing
      ? 0.45
      : 0.12;

  const scale =
    listening
      ? 1 +
        Math.min(
          0.18,
          audioLevel * 0.32
        )
      : processing
      ? 1.06
      : 1;

  return (
    <div
      className="
        relative
        flex
        h-[360px]
        w-[360px]
        items-center
        justify-center
        md:h-[430px]
        md:w-[430px]
      "
    >
      {/* Outer atmospheric glow */}

      <motion.div
        animate={{
          scale: listening
            ? [
                1,
                1.08 +
                  audioLevel * 0.16,
                1,
              ]
            : processing
            ? [1, 1.07, 1]
            : [1, 1.03, 1],
          opacity: listening
            ? [
                0.28,
                0.55 +
                  audioLevel * 0.25,
                0.28,
              ]
            : [0.16, 0.25, 0.16],
        }}
        transition={{
          duration: listening
            ? 0.55
            : 3.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          absolute
          h-[82%]
          w-[82%]
          rounded-full
          bg-gradient-to-br
          from-cyan-500/10
          via-violet-500/10
          to-red-500/10
          blur-[85px]
        "
      />

      {/* Large dark matter body */}

      <motion.div
        animate={{
          rotate: [0, 360],
          scale,
          borderRadius: [
            "43% 57% 60% 40% / 55% 42% 58% 45%",
            "58% 42% 39% 61% / 41% 61% 39% 59%",
            "47% 53% 67% 33% / 62% 37% 63% 38%",
            "43% 57% 60% 40% / 55% 42% 58% 45%",
          ],
        }}
        transition={{
          rotate: {
            duration: listening
              ? 7
              : 18,
            repeat: Infinity,
            ease: "linear",
          },
          scale: {
            duration: listening
              ? 0.25
              : 1.5,
            ease: "easeOut",
          },
          borderRadius: {
            duration: listening
              ? 2.2
              : 6,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
        className="
          relative
          z-10
          h-[70%]
          w-[70%]
          overflow-hidden
          border
          border-white/[0.08]
          bg-[#070910]
          shadow-[0_0_120px_rgba(70,40,140,0.16)]
        "
      >
        {/* Liquid internal gradient */}

        <motion.div
          animate={{
            rotate: [0, -360],
            scale: [
              1,
              1.15,
              0.92,
              1.08,
              1,
            ],
            x: [
              "0%",
              "6%",
              "-5%",
              "4%",
              "0%",
            ],
            y: [
              "0%",
              "-6%",
              "4%",
              "-3%",
              "0%",
            ],
          }}
          transition={{
            duration: listening
              ? 4
              : 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            absolute
            inset-[-25%]
            bg-[radial-gradient(circle_at_30%_30%,rgba(34,211,238,0.42),transparent_28%),radial-gradient(circle_at_72%_62%,rgba(124,58,237,0.38),transparent_34%),radial-gradient(circle_at_45%_80%,rgba(239,68,68,0.24),transparent_26%)]
            blur-[24px]
          "
        />

        {/* Inner moving mass */}

        <motion.div
          animate={{
            rotate: [360, 0],
            scale: listening
              ? [
                  0.9,
                  1.18 +
                    audioLevel * 0.18,
                  0.88,
                  1,
                ]
              : [
                  0.9,
                  1.08,
                  0.94,
                  1,
                ],
            borderRadius: [
              "58% 42% 31% 69%",
              "32% 68% 61% 39%",
              "67% 33% 48% 52%",
              "58% 42% 31% 69%",
            ],
          }}
          transition={{
            duration: listening
              ? 2.1
              : 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            absolute
            left-[20%]
            top-[20%]
            h-[58%]
            w-[58%]
            bg-gradient-to-br
            from-cyan-400/40
            via-violet-500/25
            to-transparent
            blur-[14px]
          "
        />

        {/* Dark center */}

        <motion.div
          animate={{
            scale: listening
              ? [
                  0.72,
                  0.88 +
                    audioLevel * 0.12,
                  0.72,
                ]
              : [0.72, 0.78, 0.72],
          }}
          transition={{
            duration: listening
              ? 0.5
              : 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            absolute
            left-1/2
            top-1/2
            h-[52%]
            w-[52%]
            -translate-x-1/2
            -translate-y-1/2
            rounded-[42%_58%_63%_37%/52%_37%_63%_48%]
            border
            border-white/[0.05]
            bg-[#020307]
            shadow-[inset_0_0_60px_rgba(0,0,0,0.9)]
          "
        />

        {/* Energy particles */}

        {[0, 1, 2, 3, 4, 5].map(
          (particle) => (
            <motion.div
              key={particle}
              animate={{
                x: [
                  0,
                  (particle % 2 === 0
                    ? 1
                    : -1) *
                    (18 +
                      audioLevel * 30),
                  0,
                ],
                y: [
                  0,
                  particle % 3 === 0
                    ? -22
                    : 18,
                  0,
                ],
                opacity: listening
                  ? [
                      0.15,
                      0.75,
                      0.15,
                    ]
                  : [
                      0.08,
                      0.3,
                      0.08,
                    ],
              }}
              transition={{
                duration:
                  1.6 +
                  particle * 0.18,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="
                absolute
                h-1.5
                w-1.5
                rounded-full
                bg-cyan-300
                shadow-[0_0_16px_rgba(34,211,238,0.9)]
              "
              style={{
                left: `${18 + particle * 11}%`,
                top: `${24 + (particle % 3) * 22}%`,
              }}
            />
          )
        )}

        {/* Noise-like scan layer */}

        <motion.div
          animate={{
            opacity: listening
              ? [
                  0.08,
                  0.24 +
                    intensity * 0.2,
                  0.08,
                ]
              : [0.04, 0.1, 0.04],
          }}
          transition={{
            duration: listening
              ? 0.8
              : 4,
            repeat: Infinity,
          }}
          className="
            absolute
            inset-0
            bg-[repeating-linear-gradient(120deg,transparent_0,transparent_10px,rgba(255,255,255,0.035)_11px,transparent_12px)]
            mix-blend-screen
          "
        />
      </motion.div>

      {/* Orbiting fragments */}

      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: listening
            ? 5
            : 16,
          repeat: Infinity,
          ease: "linear",
        }}
        className="
          absolute
          inset-[7%]
          z-20
        "
      >
        <div
          className="
            absolute
            left-[12%]
            top-[18%]
            h-2
            w-8
            rotate-[24deg]
            rounded-full
            bg-cyan-400/70
            blur-[1px]
            shadow-[0_0_18px_rgba(34,211,238,0.8)]
          "
        />

        <div
          className="
            absolute
            bottom-[16%]
            right-[10%]
            h-1.5
            w-6
            -rotate-[35deg]
            rounded-full
            bg-violet-400/70
            shadow-[0_0_16px_rgba(139,92,246,0.8)]
          "
        />

        <div
          className="
            absolute
            right-[13%]
            top-[22%]
            h-2
            w-2
            rounded-full
            bg-red-400
            shadow-[0_0_20px_rgba(248,113,113,0.9)]
          "
        />
      </motion.div>
    </div>
  );
}