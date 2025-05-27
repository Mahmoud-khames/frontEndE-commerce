import React from "react";
import { FilterData } from "../../../data/data";

export default function Filter() {
  return (
    <div className="hidden md:flex items-center justify-center flex-col">
      <ul className="flex flex-col gap-3 text-black ">
        {FilterData.map((item) => (
          <li key={item.id} className="cursor-pointer hover:text-secondary">
            {item.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
