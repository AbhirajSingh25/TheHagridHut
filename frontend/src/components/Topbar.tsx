import {

  Bell,

  Search,

  Sparkles,

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

        <p
          className="
            text-zinc-500
            text-lg
          "
        >
          Welcome back
        </p>

        <h2
          className="
            text-4xl
            font-black
            mt-1
          "
        >
          AI Interview Platform
        </h2>

      </div>


      <div
        className="
          flex
          items-center
          gap-5
        "
      >

        <div
          className="
            relative
            w-[340px]
          "
        >

          <Search
            className="
              absolute
              left-5
              top-1/2
              -translate-y-1/2
              text-zinc-500
              w-5
              h-5
            "
          />

          <input
            placeholder="
              Search interviews...
            "
            className="
              w-full
              bg-[#0a0a0a]
              border
              border-white/10
              rounded-2xl
              py-4
              pl-14
              pr-5
              outline-none
              text-white
              focus:border-red-500/30
              transition-all
            "
          />

        </div>


        <button
          className="
            w-14
            h-14
            rounded-2xl
            bg-[#0a0a0a]
            border
            border-white/10
            flex
            items-center
            justify-center
            relative
          "
        >

          <Bell className="w-5 h-5" />

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
            flex
            items-center
            gap-3
            px-6
            h-14
            rounded-2xl
            bg-red-600
            hover:bg-red-500
            transition-all
            shadow-[0_0_40px_rgba(255,0,0,0.25)]
            font-bold
          "
        >

          <Sparkles size={18} />

          Upgrade AI

        </button>

      </div>

    </div>
  );
}

export default TopBar;