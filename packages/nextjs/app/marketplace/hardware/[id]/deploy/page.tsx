"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import Modal from "~~/components/design/Modal";
import Api from "~~/utils/api";

export default function Deploy() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const params = useParams();
  const hardwareId = params.id as string; // Get the hardware ID from the URL
  const [hardware, setHardware] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState<string>(``);
  const [hoursModalOpen, setHoursModalOpen] = useState(false);
  const [deploymentDetails, setDeploymentDetails] = useState();
  const handleDeploy = async () => {
    console.log("set deploy");
    setHoursModalOpen(false);
    if (!code.trim()) {
      toast.error("Please enter code to deploy.");
      return;
    }

    if (!isConnected) {
      toast.error("Please connect your wallet");
      connect({ connector: injected() });
      return;
    }

    try {
      const response = await Api.post("/save-deployment", {
        userAddress: address, // Replace with dynamic user address if available
        daoAddress: hardware?.dao?.address,
        script: code,
      });

      if (response) {
        console.log("Deployment saved:", response.data);

        const heading = "Deployment Successful";
        const description = `Your code has been deployed to the ${hardware?.hardware?.name}.`;
        // Use toast.custom to render a structured toast
        toast.custom(
          t => (
            <div
              className={`bg-white border border-gray-200 rounded-lg shadow-md p-4 max-w-sm transition-all ${
                t.visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-lg font-semibold text-gray-800">{heading}</h4>
                <button onClick={() => toast.dismiss(t.id)} className="text-gray-500 hover:text-gray-700">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="text-gray-600 text-sm mb-2">{description}</div>
            </div>
          ),
          {
            duration: 1000,
            position: "bottom-left", // Updated to bottom-left as per your earlier request
          },
        );
        fetchDeployment();
      }
    } catch (error) {
      console.error("Error saving deployment:", error);
      toast.error("Failed to deploy code. Please try again.");
    }
  };
  useEffect(() => {
    const fetchHardware = async () => {
      try {
        const response = await Api.get<any>(`/dao-details?daoAddress=${hardwareId}`);

        console.log(response.data, "response");
        const data = response.data;

        setHardware(data);
      } catch (err) {
        setError("Failed to fetch hardware details. Please try again later.");
        console.error("Error fetching hardware details:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHardware();
  }, [hardwareId]);

  function timeAgo(date: any) {
    const now = new Date();
    const timeDifference = now - new Date(date); // difference in milliseconds

    const seconds = Math.floor(timeDifference / 1000); // convert to seconds
    const minutes = Math.floor(seconds / 60); // convert to minutes
    const hours = Math.floor(minutes / 60); // convert to hours
    const days = Math.floor(hours / 24); // convert to days

    console.log(minutes, "minutes");

    if (minutes < 1) {
      return "Just now"; // Less than a minute
    } else if (minutes < 60) {
      return `${minutes} minutes ago`; // Less than an hour
    } else if (hours < 24) {
      return `${hours} hours ago`; // Less than a day
    } else if (days < 30) {
      return `${days} days ago`; // Less than a month
    } else {
      const months = Math.floor(days / 30);
      return `${months} months ago`; // More than a month
    }
  }

  useEffect(() => {
    if (address) {
      fetchDeployment();
    }
  }, [address]);

  const fetchDeployment = async () => {
    console.log(address, "address");
    console.log(hardwareId, "hardwareId");
    try {
      const deploymentsResponse = (await Api.post("/get-deployments", {
        userAddress: address,
        daoAddress: hardwareId,
      })) as any;
      setDeploymentDetails(deploymentsResponse?.data[0]);
      if (deploymentsResponse.data && deploymentsResponse.data.length > 0) {
        setCode(deploymentsResponse.data[0].script);
      }
      console.log(deploymentsResponse?.data, "response");
    } catch (err) {
      toast.error("Failed to fetch deployments. Please try again later.");
      console.error("Error fetching deployments:", err);
    }
  };

  const [activeTab, setActiveTab] = useState("Javascript");

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading..</div>;
  }

  if (error || !hardware) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        <p>{error || "Hardware not found."}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-2 m-4 opacity-0 transform translate-y-10 transition-all duration-1000 ease-out animate-fadeInUp">
        {/* Left Panel - Deploy Code */}
        <div className="w-2/3 p-4">
          <div className="bg-white rounded-lg shadow-md p-9">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">Deploy Code</h2>
                <div className="text-gray-600">Write or paste your code to deploy to AMD MI250X</div>
              </div>
              <div>
                {/* <div className="text-green-500 bg-green-100 inline-block px-2 pt-1 rounded">Rented</div> */}
              </div>
            </div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <ul
                  className="flex ml-3 rounded-lg flex-wrap text-sm font-medium text-center dark:text-gray-400 mt-4 w-full"
                  role="tablist"
                >
                  {[{ name: "Javascript", enabled: true }].map((tab: any) => (
                    <li key={tab.name} className="bg-gray-100">
                      <button
                        onClick={() => tab.enabled && setActiveTab(tab.name)}
                        className={`inline-block p-2 rounded-lg text-lg transition-colors ${
                          activeTab === tab.name && tab.enabled
                            ? "text-blue-600 bg-gray-50 active dark:bg-gray-800 dark:text-blue-500"
                            : tab.enabled
                              ? "hover:text-gray-600 hover:bg-gray-50 bg-gray-100"
                              : "text-gray-400 cursor-not-allowed dark:text-gray-500"
                        }`}
                        role="tab"
                        aria-selected={activeTab === tab.name}
                        aria-controls={`${tab.name.toLowerCase().replace(/\s/g, "-")}-panel`}
                        disabled={!tab.enabled}
                      >
                        {tab.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <button className="mt-4 bg-white px-4 border py-2 text-lg rounded w-full"> Load Template</button>
              </div>
            </div>
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="Enter your JavaScript code here..."
              className="w-full h-[600px] p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end">
              <button
                onClick={() => setHoursModalOpen(true)}
                className="mt-4 bg-black text-lg text-white px-4 py-3 rounded"
              >
                Deploy to Hardware
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Hardware Specs */}
        <div className="w-1/3 p-4">
          <div className="bg-white rounded-lg shadow-md p-9">
            <h3 className="text-3xl mt-3 font-bold">Hardware Specifications</h3>
            <p className="mb-4 text-gray-400">{hardware?.hardware?.name})</p>
            <div className="grid grid-cols-2 gap-y-2">
              <div className="text-gray-400 font-medium text-left text-lg">Hardware</div>
              <div className="text-left text-xl">
                {hardware?.hardware?.name} {hardware?.hardware?.memory}
              </div>
              <div className="text-gray-400 font-medium text-left text-lg">Performance</div>
              <div className="text-left text-xl">
                {hardware?.hardware?.performance + " " + (hardware?.hardware?.memory || "")}
              </div>
              <div className="text-gray-400 font-medium text-left text-lg">Location</div>
              <div className="text-left text-xl">{hardware?.hardware?.location}</div>
              {deploymentDetails?.createdAt && (
                <>
                  <div className="text-gray-400 font-medium text-left text-lg">Running</div>
                  <div className="text-left text-xl">
                    {deploymentDetails?.createdAt ? timeAgo(deploymentDetails.createdAt) : ""}
                  </div>
                </>
              )}
            </div>
            <div className="m-2 p-5 bg-gray-50 mt-6">
              <div className="font-medium text-left text-xl">Deployment Info</div>
              <div className="text-left text-gray-600 text-md mt-1">Your code will run directly on this hardware.</div>
              <div className="flex items-center justify-between mt-2">
                <div className="font-medium text-left text-lg">Rental Period</div>
                <div className="text-left text-xl">Active</div>
              </div>
            </div>
            <div className="m-2 p-5 bg-gray-50 mt-4">
              <h4 className="text-lg font-semibold">Usage Tips</h4>
              <ul className="list-disc list-inside text-gray-600">
                <li>Code execution is secure and isolated</li>
                <li>Results are stored for 30 days</li>
                <li>Max execution time: 48 hours</li>
                <li>Data persistence between runs</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Modal
        isOpen={hoursModalOpen}
        onClose={() => setHoursModalOpen(false)}
        title="Deployment Config"
        description="Select the number of hours you want to deploy your code for."
      >
        <div>
          <h2>Deployment duration</h2>
          <div className="flex flex-col gap-2">
            <select className="w-full p-2 border bg-white border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="1">4 hours</option>
              <option value="2">24 hours</option>
              <option value="3">48 hours</option>
            </select>
            <button onClick={() => handleDeploy()} className="mt-4 bg-black text-lg text-white px-4 py-3 rounded">
              Deploy to Hardware
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
