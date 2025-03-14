import React from "react";
import Image from "next/image";
import Acquirer from "../../public/acqurer.svg";
import Setting from "../../public/setting.svg";
import StakeHolder from "../../public/stakeholder.svg";
import User from "../../public/user.svg";

const HowItWorks = () => {
  const cardData = [
    {
      number: "01",
      numberColor: "text-blue-600",
      title: "Hardware Provider",
      iconSrc: Setting,
      description:
        "List computing hardware with 100% token ownership. Approve token sales while maintaining governance rights.",
    },
    {
      number: "02",
      numberColor: "text-gray-400",
      iconSrc: StakeHolder,
      title: "Token Stakeholder",
      description:
        "Purchase hardware shares. Vote on rental pricing and earn passive income from your fractional investment.",
    },
    {
      number: "03",
      numberColor: "text-gray-400",
      iconSrc: User,
      title: "Computing User",
      description: "Rent hardware resources at agreed rates. Deploy code while fees are distributed to token holders.",
    },
    {
      number: "04",
      numberColor: "text-gray-400",
      iconSrc: Acquirer,
      title: "Complete Acquirer",
      description:
        "Gain 100% ownership by purchasing all tokens. Delist hardware, transfer the NFT, or sell independently.",
    },
  ];

  return (
    <section className="py-12 bg-zinc-50 mb-4">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-4xl font-bold text-gray-900">How It Works</h2>
      </div>

      {/* Subtitle Box */}
      <div className="text-center mb-12 text-gray-600">
        <div className="inline-block px-4 py-2 rounded">
          <p className="text-lg">
            Our platform creates different experiences for four key user personas, each with their
            <br></br>
            own journey and capabilities.
          </p>
        </div>
      </div>

      {/* Cards Container - Using flex to fill full width */}
      <div className="flex flex-col gap-6 px-12 md:flex-row w-full">
        {cardData.map((card, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center text-center flex-1"
            style={{ width: "300px" }}
          >
            <div className="flex items-center justify-between w-full m-4">
              <span className={`text-3xl text-gray-400 ${card.numberColor} mb-2`}>{card.number}</span>
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                <Image src={card.iconSrc} alt={`${card.title} icon`} width={20} height={20} />
              </div>
            </div>
            <div className="flex flex-col items-start">
              <h3 className="text-xl font-semibold text-gray-900 mb-1">{card.title}</h3>
              <p className="text-gray-600 text-md text-start">{card.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
