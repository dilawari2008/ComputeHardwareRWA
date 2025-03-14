"use client";

import type { NextPage } from "next";
import Hero from "~~/components/design/Hero";
import HowItWorks from "~~/components/design/HowItWorks";

const Home: NextPage = () => {
  return (
    <>
      <Hero />
      <HowItWorks />
    </>
  );
};

export default Home;
