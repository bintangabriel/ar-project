'use client';

import { Icon } from "@iconify/react";
import { footerSections } from '../../config/data';

const FooterSection = () => {
  return (

    <footer className="bg-[#B6310E] text-gray-200 rounded-t-3xl">
      <div className="sm:px-12 px-8 py-10 max-w-7xl sm:mx-auto mx-1 grid sm:grid-cols-3 gap-8">
        {footerSections.map((section, index) => (
          <div key={index} className="hidden sm:block">
            <h3 className="text-base font-semibold text-white">{section.title}</h3>
            <ul className="mt-4 space-y-2 text-sm">
              {section.links.map((link, linkIndex) => (
                <li key={linkIndex}>
                  <a href="#" className="hover:text-white text-neutral-200">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

      </div>
      <div className="w-full border-t-2 border-black/20 py-2">
        <p className="w-full text-center text-sm">© 2026 Habitus. All rights reserved.</p>
      </div>
    </footer >
  );
};

export default FooterSection