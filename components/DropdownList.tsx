"use client";
import Image from "next/image";
import { useState } from "react";


const DropdownList = () => {
  const [isOpen, setIsOpen] = useState(false);

  // const handleOptionClick = (option: string) => {
  //   onOptionSelect(option);
  //   setIsOpen(false);
  // };

  return (
    <div className="relative">
      <div className="cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="filter-trigger">
          <figure>
          <Image src={'/assets/icons/hamburger.svg'} alt="menu" height={14} width={14} />
            Most Recent
          </figure>
          <Image src={'/assets/icons/arrow-down.svg'} alt="arrow" width={20} height={20} />
        </div>
      </div>

      {isOpen && (
        <ul className="dropdown">
          {['Most Recent', 'Most Liked'].map((option) => (
            <li
              key={option}
              className="list-item"
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DropdownList
