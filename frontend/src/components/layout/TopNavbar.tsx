import {
  Bell,
  Search,
} from "lucide-react";

function TopNavbar() {

  return (

    <div
      className="
        h-20
        flex
        items-center
        justify-between
        mb-8
      "
    >

      <div
        className="
          flex
          items-center
          gap-4
        "
      >

        <div
          className="
            w-12
            h-12
            rounded-2xl
            bg-red-600
            flex
            items-center
            justify-center
            font-black
            text-xl
          "
        >
          H
        </div>

        <div>

          <h1
            className="
              text-2xl
              font-black
            "
          >
            HireSense AI
          </h1>

          <p
            className="
              text-zinc-500
              text-sm
            "
          >
            AI Interview Intelligence Platform
          </p>

        </div>

      </div>

      <div
        className="
          flex
          items-center
          gap-4
        "
      >

        <div
          className="
            w-12
            h-12
            rounded-2xl
            bg-[#0f0f0f]
            border
            border-white/5
            flex
            items-center
            justify-center
          "
        >

          <Search size={18} />

        </div>

        <div
          className="
            w-12
            h-12
            rounded-2xl
            bg-[#0f0f0f]
            border
            border-white/5
            flex
            items-center
            justify-center
          "
        >

          <Bell size={18} />

        </div>

      </div>

    </div>
  );
}

export default TopNavbar;