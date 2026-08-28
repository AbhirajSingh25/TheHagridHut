import {
  Bell,
  Search,
} from "lucide-react";

function TopBar() {

  return (

    <div
      className="
        flex
        items-center
        justify-between
        mb-10
      "
    >

      <div>

        <h1
          className="
            text-5xl
            font-black
            mb-2
          "
        >
          Welcome back 👋
        </h1>

        <p
          className="
            text-zinc-400
            text-lg
          "
        >
          Track your AI interview performance
        </p>

      </div>


      <div
        className="
          flex
          items-center
          gap-5
        "
      >

        <button
          className="
            w-14
            h-14
            rounded-2xl
            bg-white/5
            border
            border-white/10
            flex
            items-center
            justify-center
          "
        >

          <Search size={22} />

        </button>


        <button
          className="
            relative
            w-14
            h-14
            rounded-2xl
            bg-white/5
            border
            border-white/10
            flex
            items-center
            justify-center
          "
        >

          <Bell size={22} />

          <div
            className="
              absolute
              top-3
              right-3
              w-2
              h-2
              rounded-full
              bg-red-500
            "
          />

        </button>


        <button
          className="
            px-7
            py-4
            rounded-2xl
            bg-cyan-500
            text-black
            font-bold
            hover:scale-105
            transition-all
          "
        >
          Start New Interview
        </button>

      </div>

    </div>
  );
}

export default TopBar;