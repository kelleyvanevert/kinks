import { useState } from "react";
import { ModalPortal } from "@/ui/modalroot";
import { shuffle } from "@/lib/shuffle";
import { Kinks } from "@/lib/kinks";

function getRandomKinks() {
  return shuffle(Kinks).slice(0, 10);
}

export function KinkModal() {
  const [kink, setKink] = useState("");

  const [suggestions, setSuggestions] = useState(() => getRandomKinks());

  return (
    <ModalPortal>
      <div className="fixed inset-0 bg-emerald-900 bg-opacity-70 flex flex-col justify-center items-center px-3">
        <div className="bg-white rounded-lg py-4 px-5 w-full max-w-[440px] shadow-lg animate-success">
          <div className="font-display text-2xl mb-1">What's the kink?</div>

          <div className="text-gray-700 mb-8">
            Some suggestions:{" "}
            {suggestions.map((kink) => {
              return (
                <>
                  <button
                    type="button"
                    className="text-white text-sm px-[6px] bg-emerald-700 rounded-full inline-block"
                    onClick={() => setKink(kink)}
                  >
                    {kink}
                  </button>{" "}
                </>
              );
            })}{" "}
            <button
              type="button"
              className="group text-sm text-emerald-800"
              onClick={() => setSuggestions(getRandomKinks())}
            >
              (<span className="group-focus:underline">new suggestions</span>)
            </button>
          </div>

          <input
            type="text"
            className="border-2 rounded-lg w-full placeholder:text-gray-400 text-lg px-3 py-2 outline-none border-gray-300 focus:border-emerald-700"
            // placeholder="Group code"
            pattern="[a-zA-Z0-9_-]*"
            value={kink}
            onChange={(e) => setKink(e.target.value)}
          />

          <div className="flex"></div>
        </div>
      </div>
    </ModalPortal>
  );
}
