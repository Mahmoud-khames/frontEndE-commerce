import React from "react";

export default function Title({
  title,
  text,
}: {
  title: string;
  text?: string;
}) {
  return (
    <div className="flex flex-col items-start gap-4 w-[300px] h-[103px]">
      <div className="flex items-center justify-center gap-4 ">
        <div className="w-5 h-10 bg-secondary rounded"></div>
        <h4 className="text-[16px] font-simibold text-secondary">{title}</h4>
      </div>
      <h5
        className="text-[26px] md:text-[36px] font-semibold text-[#000000] leading-[48px]  text-nowrap"
        style={{ letterSpacing: "0.04em" }}
      >
        {text}
      </h5>
    </div>
  );
}
