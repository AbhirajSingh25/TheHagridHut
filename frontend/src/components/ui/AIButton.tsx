import React from "react";

interface Props {
    children: React.ReactNode;
    onClick?: () => void;
}

export default function AIButton({
    children,
    onClick,
}: Props) {

    return (
        <button
            onClick={onClick}
            className="
            group
            relative
            overflow-hidden
            rounded-xl
            px-6
            py-3
            font-medium
            text-white
            bg-gradient-to-r
            from-purple-600
            to-cyan-500
            transition-all
            duration-300
            hover:scale-105
            shadow-lg
            shadow-purple-500/20
            "
        >

            <span className="
                relative
                z-10
            ">
                {children}
            </span>

        </button>
    );
}