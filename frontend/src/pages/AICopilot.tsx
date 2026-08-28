import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  askAICopilot,
} from "../services/api";

import PageContainer from "../components/ui/PageContainer";
import PageHeader from "../components/ui/PageHeader";

import {
  Brain,
  Sparkles,
  Send,
  Bot,
  User,
  Mic,
  MicOff,
  RotateCcw,
  Copy,
  Check,
  BriefcaseBusiness,
  FileText,
  Code2,
  Users,
  Lightbulb,
  ChevronRight,
} from "lucide-react";


type MessageRole =
  | "assistant"
  | "user";


type ChatMessage = {
  id: number;
  role: MessageRole;
  content: string;
};


const starterPrompts = [
  {
    icon: BriefcaseBusiness,
    title: "Interview Strategy",
    description:
      "Prepare for HR, behavioral, and recruiter rounds.",
    prompt:
      "Help me prepare a strong strategy for my upcoming interview.",
  },

  {
    icon: Code2,
    title: "Technical Prep",
    description:
      "Understand technical concepts and interview questions.",
    prompt:
      "Help me prepare for a technical software engineering interview.",
  },

  {
    icon: FileText,
    title: "Resume Review",
    description:
      "Improve resume positioning for a specific role.",
    prompt:
      "Help me identify weaknesses in my resume and improve it for my target role.",
  },

  {
    icon: Users,
    title: "Behavioral Answers",
    description:
      "Build stronger STAR-format interview responses.",
    prompt:
      "Help me answer behavioral interview questions using the STAR method.",
  },
];


const initialMessages: ChatMessage[] = [
  {
    id: 1,
    role: "assistant",
    content:
      "I’m your AI career copilot. I can help you prepare for interviews, improve answers, explain technical concepts, practice behavioral questions, analyze recruiter expectations, and strengthen your career strategy.",
  },
];


function AICopilot() {

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    messages,
    setMessages,
  ] = useState<ChatMessage[]>(
    initialMessages
  );

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    copiedId,
    setCopiedId,
  ] = useState<number | null>(
    null
  );

  const [
    listening,
    setListening,
  ] = useState(false);


  const bottomRef =
    useRef<HTMLDivElement | null>(
      null
    );


  const recognitionRef =
    useRef<any>(null);


  useEffect(() => {

    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });

  }, [
    messages,
    loading,
  ]);


  async function handleSend(
    prompt?: string
  ) {

    const finalMessage =
      prompt || message.trim();


    if (
      !finalMessage ||
      loading
    ) {
      return;
    }


    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      content: finalMessage,
    };


    setMessages((prev) => [
      ...prev,
      userMessage,
    ]);


    setMessage("");

    setLoading(true);


    try {

      const response =
        await askAICopilot(
          finalMessage
        );


      const reply =
        response?.reply ||
        response?.response ||
        response?.message ||
        "I couldn't generate a useful response right now.";


      const aiMessage: ChatMessage = {
        id:
          Date.now() + 1,
        role:
          "assistant",
        content:
          reply,
      };


      setMessages((prev) => [
        ...prev,
        aiMessage,
      ]);

    } catch (
      error
    ) {

      console.error(
        "AI Copilot Error:",
        error
      );


      const errorMessage: ChatMessage = {
        id:
          Date.now() + 1,
        role:
          "assistant",
        content:
          "I couldn't reach the AI engine right now. Your frontend is working, but the backend AI service needs attention. Apparently even artificial intelligence occasionally decides to become artificial inconvenience.",
      };


      setMessages((prev) => [
        ...prev,
        errorMessage,
      ]);

    } finally {

      setLoading(false);

    }
  }


  function handleKeyDown(
    event:
      React.KeyboardEvent<
        HTMLTextAreaElement
      >
  ) {

    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {

      event.preventDefault();

      handleSend();

    }
  }


  function clearConversation() {

    if (loading) {
      return;
    }


    setMessages(
      initialMessages
    );


    setMessage("");

  }


  async function copyMessage(
    id: number,
    content: string
  ) {

    try {

      await navigator.clipboard.writeText(
        content
      );


      setCopiedId(id);


      window.setTimeout(
        () => {

          setCopiedId(
            null
          );

        },
        1800
      );

    } catch (
      error
    ) {

      console.error(
        "Copy failed:",
        error
      );

    }
  }


  function toggleVoiceInput() {

    const SpeechRecognition =
      (
        window as any
      ).SpeechRecognition ||
      (
        window as any
      ).webkitSpeechRecognition;


    if (!SpeechRecognition) {

      alert(
        "Voice input is not supported in this browser."
      );

      return;
    }


    if (
      listening &&
      recognitionRef.current
    ) {

      recognitionRef.current.stop();

      setListening(false);

      return;
    }


    const recognition =
      new SpeechRecognition();


    recognition.continuous =
      false;

    recognition.interimResults =
      true;

    recognition.lang =
      "en-US";


    recognition.onstart =
      () => {

        setListening(true);

      };


    recognition.onresult =
      (
        event: any
      ) => {

        let transcript = "";


        for (
          let i =
            event.resultIndex;
          i <
            event.results.length;
          i++
        ) {

          transcript +=
            event.results[
              i
            ][0].transcript;

        }


        setMessage(
          transcript
        );

      };


    recognition.onerror =
      (
        error: any
      ) => {

        console.error(
          "Voice recognition error:",
          error
        );

        setListening(false);

      };


    recognition.onend =
      () => {

        setListening(false);

      };


    recognitionRef.current =
      recognition;


    recognition.start();

  }


  return (

    <PageContainer>

      <div className="mb-8">

        <PageHeader
          badge="AI COPILOT"
          title="Career Intelligence"
          description="Your personal AI assistant for interview preparation, technical guidance, behavioral coaching, recruiter expectations, and career decisions."
        />

      </div>


      {/* MAIN GRID */}

      <div
        className="
          grid
          grid-cols-1
          gap-6
          xl:grid-cols-[minmax(0,1fr)_330px]
        "
      >


        {/* CHAT PANEL */}

        <section
          className="
            overflow-hidden
            rounded-2xl
            border
            border-white/[0.07]
            bg-[#090a10]/80
            backdrop-blur-xl
          "
        >


          {/* CHAT HEADER */}

          <div
            className="
              flex
              flex-col
              gap-4
              border-b
              border-white/[0.06]
              px-5
              py-5
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
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-violet-500/20
                  bg-violet-500/10
                "
              >

                <Brain
                  size={20}
                  className="
                    text-violet-400
                  "
                />

              </div>


              <div>

                <div
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >

                  <h2
                    className="
                      text-base
                      font-semibold
                      tracking-tight
                      text-white
                    "
                  >
                    AI Interview Copilot
                  </h2>


                  <span
                    className="
                      flex
                      items-center
                      gap-1.5
                      text-[10px]
                      font-medium
                      uppercase
                      tracking-[0.14em]
                      text-emerald-400
                    "
                  >

                    <span
                      className="
                        h-1.5
                        w-1.5
                        rounded-full
                        bg-emerald-400
                        shadow-[0_0_10px_rgba(52,211,153,0.8)]
                      "
                    />

                    Online

                  </span>

                </div>


                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-500
                  "
                >
                  Context-aware career and interview assistance
                </p>

              </div>

            </div>


            <button
              onClick={
                clearConversation
              }
              disabled={
                loading
              }
              className="
                flex
                items-center
                justify-center
                gap-2
                self-start
                rounded-xl
                border
                border-white/[0.07]
                bg-white/[0.02]
                px-3.5
                py-2
                text-xs
                font-medium
                text-slate-400
                transition-all
                hover:border-white/[0.12]
                hover:bg-white/[0.05]
                hover:text-white
                disabled:cursor-not-allowed
                disabled:opacity-40
                sm:self-auto
              "
            >

              <RotateCcw
                size={14}
              />

              New chat

            </button>

          </div>



          {/* MESSAGES */}

          <div
            className="
              min-h-[520px]
              max-h-[620px]
              space-y-5
              overflow-y-auto
              px-5
              py-6
              sm:px-7
            "
          >

            {messages.map(
              (msg) => {

                const isAssistant =
                  msg.role ===
                  "assistant";


                return (

                  <div
                    key={msg.id}
                    className={`
                      flex
                      gap-3
                      ${
                        isAssistant
                          ? "justify-start"
                          : "justify-end"
                      }
                    `}
                  >


                    {isAssistant && (

                      <div
                        className="
                          flex
                          h-8
                          w-8
                          shrink-0
                          items-center
                          justify-center
                          rounded-lg
                          border
                          border-violet-500/15
                          bg-violet-500/10
                        "
                      >

                        <Bot
                          size={15}
                          className="
                            text-violet-400
                          "
                        />

                      </div>

                    )}


                    <div
                      className={`
                        group
                        max-w-[88%]
                        sm:max-w-[76%]
                      `}
                    >

                      <div
                        className={`
                          rounded-2xl
                          px-4
                          py-3.5
                          text-sm
                          leading-relaxed
                          ${
                            isAssistant
                              ? `
                                border
                                border-white/[0.07]
                                bg-white/[0.025]
                                text-slate-300
                              `
                              : `
                                border
                                border-violet-400/20
                                bg-violet-500/15
                                text-white
                              `
                          }
                        `}
                      >

                        <div
                          className="
                            mb-2
                            flex
                            items-center
                            gap-2
                          "
                        >

                          {isAssistant
                            ? (

                              <Bot
                                size={12}
                                className="
                                  text-violet-400
                                "
                              />

                            )
                            : (

                              <User
                                size={12}
                                className="
                                  text-violet-300
                                "
                              />

                            )}


                          <span
                            className="
                              text-[10px]
                              font-semibold
                              uppercase
                              tracking-[0.15em]
                              text-slate-500
                            "
                          >
                            {isAssistant
                              ? "HireSense AI"
                              : "You"}
                          </span>

                        </div>


                        <p
                          className="
                            whitespace-pre-wrap
                          "
                        >
                          {msg.content}
                        </p>

                      </div>


                      {isAssistant && (

                        <div
                          className="
                            mt-1.5
                            flex
                            justify-end
                            opacity-0
                            transition-opacity
                            group-hover:opacity-100
                          "
                        >

                          <button
                            onClick={() =>
                              copyMessage(
                                msg.id,
                                msg.content
                              )
                            }
                            className="
                              flex
                              items-center
                              gap-1.5
                              rounded-lg
                              px-2
                              py-1
                              text-[10px]
                              text-slate-500
                              transition-colors
                              hover:bg-white/[0.04]
                              hover:text-slate-300
                            "
                          >

                            {copiedId ===
                            msg.id
                              ? (

                                <Check
                                  size={12}
                                  className="
                                    text-emerald-400
                                  "
                                />

                              )
                              : (

                                <Copy
                                  size={12}
                                />

                              )}


                            {copiedId ===
                            msg.id
                              ? "Copied"
                              : "Copy"}

                          </button>

                        </div>

                      )}

                    </div>

                  </div>

                );

              }
            )}



            {loading && (

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
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-lg
                    border
                    border-violet-500/15
                    bg-violet-500/10
                  "
                >

                  <Brain
                    size={15}
                    className="
                      animate-pulse
                      text-violet-400
                    "
                  />

                </div>


                <div
                  className="
                    flex
                    items-center
                    gap-1.5
                    rounded-2xl
                    border
                    border-white/[0.07]
                    bg-white/[0.025]
                    px-4
                    py-3
                  "
                >

                  <span
                    className="
                      h-1.5
                      w-1.5
                      animate-bounce
                      rounded-full
                      bg-violet-400
                    "
                  />

                  <span
                    className="
                      h-1.5
                      w-1.5
                      animate-bounce
                      rounded-full
                      bg-violet-400
                      [animation-delay:120ms]
                    "
                  />

                  <span
                    className="
                      h-1.5
                      w-1.5
                      animate-bounce
                      rounded-full
                      bg-violet-400
                      [animation-delay:240ms]
                    "
                  />

                  <span
                    className="
                      ml-2
                      text-xs
                      text-slate-500
                    "
                  >
                    Thinking

                  </span>

                </div>

              </div>

            )}


            <div
              ref={bottomRef}
            />

          </div>



          {/* INPUT */}

          <div
            className="
              border-t
              border-white/[0.06]
              bg-black/10
              p-4
              sm:p-5
            "
          >

            <div
              className="
                flex
                items-end
                gap-3
                rounded-2xl
                border
                border-white/[0.08]
                bg-white/[0.025]
                p-2.5
                transition-colors
                focus-within:border-violet-500/35
              "
            >

              <textarea
                value={message}
                onChange={(event) =>
                  setMessage(
                    event.target.value
                  )
                }
                onKeyDown={
                  handleKeyDown
                }
                placeholder="Ask anything about your interview, career, technical preparation, resume, or recruiter expectations..."
                rows={1}
                disabled={
                  loading
                }
                className="
                  min-h-[48px]
                  flex-1
                  resize-none
                  bg-transparent
                  px-2.5
                  py-3
                  text-sm
                  leading-relaxed
                  text-white
                  outline-none
                  placeholder:text-slate-600
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              />


              <button
                onClick={
                  toggleVoiceInput
                }
                type="button"
                className={`
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  border
                  transition-all
                  ${
                    listening
                      ? `
                        border-rose-500/40
                        bg-rose-500/15
                        text-rose-400
                      `
                      : `
                        border-white/[0.08]
                        bg-white/[0.025]
                        text-slate-400
                        hover:bg-white/[0.06]
                        hover:text-white
                      `
                  }
                `}
              >

                {listening
                  ? (
                    <MicOff
                      size={17}
                    />
                  )
                  : (
                    <Mic
                      size={17}
                    />
                  )}

              </button>


              <button
                onClick={() =>
                  handleSend()
                }
                disabled={
                  loading ||
                  !message.trim()
                }
                type="button"
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-violet-500
                  text-white
                  shadow-[0_0_22px_rgba(139,92,246,0.18)]
                  transition-all
                  hover:bg-violet-400
                  hover:shadow-[0_0_30px_rgba(139,92,246,0.28)]
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >

                <Send
                  size={17}
                />

              </button>

            </div>


            <p
              className="
                mt-2.5
                px-2
                text-[10px]
                text-slate-600
              "
            >
              Press Enter to send • Shift + Enter for a new line

            </p>

          </div>

        </section>



        {/* RIGHT PANEL */}

        <aside
          className="
            space-y-5
          "
        >


          {/* QUICK ACTIONS */}

          <section
            className="
              rounded-2xl
              border
              border-white/[0.07]
              bg-[#090a10]/80
              p-5
              backdrop-blur-xl
            "
          >

            <div
              className="
                mb-5
                flex
                items-center
                gap-3
              "
            >

              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-cyan-500/10
                "
              >

                <Sparkles
                  size={16}
                  className="
                    text-cyan-400
                  "
                />

              </div>


              <div>

                <p
                  className="
                    text-[10px]
                    font-medium
                    uppercase
                    tracking-[0.2em]
                    text-cyan-400
                  "
                >
                  Quick start
                </p>


                <h3
                  className="
                    mt-1
                    text-sm
                    font-semibold
                    text-white
                  "
                >
                  What do you need help with?

                </h3>

              </div>

            </div>


            <div
              className="
                space-y-2
              "
            >

              {starterPrompts.map(
                (item) => {

                  const Icon =
                    item.icon;


                  return (

                    <button
                      key={
                        item.title
                      }
                      onClick={() =>
                        handleSend(
                          item.prompt
                        )
                      }
                      disabled={
                        loading
                      }
                      className="
                        group
                        flex
                        w-full
                        items-center
                        gap-3
                        rounded-xl
                        border
                        border-white/[0.06]
                        bg-white/[0.015]
                        p-3
                        text-left
                        transition-all
                        hover:border-violet-500/20
                        hover:bg-violet-500/[0.04]
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    >

                      <div
                        className="
                          flex
                          h-8
                          w-8
                          shrink-0
                          items-center
                          justify-center
                          rounded-lg
                          bg-white/[0.04]
                        "
                      >

                        <Icon
                          size={14}
                          className="
                            text-violet-400
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
                            text-xs
                            font-medium
                            text-slate-200
                          "
                        >
                          {item.title}
                        </p>


                        <p
                          className="
                            mt-0.5
                            line-clamp-2
                            text-[10px]
                            leading-relaxed
                            text-slate-600
                          "
                        >
                          {
                            item.description
                          }
                        </p>

                      </div>


                      <ChevronRight
                        size={14}
                        className="
                          text-slate-600
                          transition-transform
                          group-hover:translate-x-0.5
                          group-hover:text-violet-400
                        "
                      />

                    </button>

                  );

                }
              )}

            </div>

          </section>



          {/* AI CAPABILITIES */}

          <section
            className="
              rounded-2xl
              border
              border-white/[0.07]
              bg-[#090a10]/80
              p-5
              backdrop-blur-xl
            "
          >

            <div
              className="
                mb-4
                flex
                items-center
                gap-3
              "
            >

              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-violet-500/10
                "
              >

                <Lightbulb
                  size={16}
                  className="
                    text-violet-400
                  "
                />

              </div>


              <div>

                <p
                  className="
                    text-[10px]
                    font-medium
                    uppercase
                    tracking-[0.2em]
                    text-violet-400
                  "
                >
                  Intelligence
                </p>


                <h3
                  className="
                    mt-1
                    text-sm
                    font-semibold
                    text-white
                  "
                >
                  Copilot capabilities

                </h3>

              </div>

            </div>


            <div
              className="
                space-y-3
              "
            >

              {[
                "Interview answer improvement",
                "Technical concept explanations",
                "Behavioral response coaching",
                "Recruiter expectation analysis",
                "Career strategy guidance",
                "Resume and job alignment",
              ].map(
                (item) => (

                  <div
                    key={item}
                    className="
                      flex
                      items-center
                      gap-2.5
                      text-xs
                      text-slate-500
                    "
                  >

                    <span
                      className="
                        h-1.5
                        w-1.5
                        shrink-0
                        rounded-full
                        bg-violet-400
                      "
                    />

                    {item}

                  </div>

                )
              )}

            </div>

          </section>

        </aside>

      </div>

    </PageContainer>

  );
}


export default AICopilot;