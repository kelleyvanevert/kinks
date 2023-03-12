import { useState } from "react";
import { useRouter } from "next/router";

export default function HomePage() {
  const router = useRouter();

  const [groupCode, setGroupCode] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        router.push(`/` + groupCode.replace(/[^a-zA-Z0-9_-]/g, ""));
      }}
      className="absolute inset-0 flex flex-col justify-center items-center p-10"
    >
      <h1 className="text-center font-display text-pink-500 text-6xl lg:text-8xl tracking-tight">
        Kinks with friends
      </h1>

      <div className="mt-6 max-w-[300px]">
        <input
          type="text"
          className="border-2 rounded-lg w-full text-center placeholder:text-gray-400 text-xl px-3 py-2"
          placeholder="Group code"
          pattern="[a-zA-Z0-9_-]*"
          value={groupCode}
          onChange={(e) =>
            setGroupCode(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))
          }
        />

        <button
          type="submit"
          className="mt-2 rounded-lg w-full text-center text-xl px-3 py-2 bg-pink-500 text-white transition-transform active:scale-95"
        >
          Go!
        </button>
      </div>
    </form>
  );
}
