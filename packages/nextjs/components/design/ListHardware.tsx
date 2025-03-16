import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Api from "../../utils/api/index";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { hardwareSchema } from "~~/schema/hardware";
import { signAndSendTransaction } from "~~/utils/web3Utils";

interface FormData {
  hardwareName: string;
  totalTokens: number;
  tokenPrice: number;
  hardwareImage: string | null;
  cpu: string;
  memory: string;
  location: string;
}

const ListHardware = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    getValues,
  } = useForm({
    resolver: zodResolver(hardwareSchema),
    defaultValues: {
      hardwareName: "",
      totalTokens: 0,
      // @ts-ignore
      tokenPrice: 0,
      hardwareImage: null,
      cpu: "",
      memory: "",
      location: "",
    },
  });
  const [imagePreview, setImagePreview] = React.useState(null);
  const [isImageLoading, setIsImageLoading] = React.useState<any>(); // Import Zustand store
  const [isLoading, setIsLoading] = React.useState<any>();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const [isValidated, setIsValidated] = useState(false);

  const onSubmit = async (data: FormData) => {
    setIsValidated(true);
    if (!isConnected) {
      toast.error("Please connect your wallet");
      connect({ connector: injected() });
      return;
    }

    setIsLoading(true);
    await listHardwareApi(data);
  };

  useEffect(() => {
    if (address && isValidated) {
      listHardwareApi(getValues());
    }
  }, [address]);

  const listHardwareApi = async (data: any) => {
    try {
      // Prepare the payload according to the curl command
      const payload = {
        hardwareName: data.hardwareName,
        totalTokens: data.totalTokens,
        tokenPrice: Number(data.tokenPrice),
        rentalPrice: 0.0002,
        imageUrl: imagePreview,
        cpu: data.cpu,
        memory: data.memory,
        location: data.location,
        userAddress: address,
        instanceId: data.instanceId,
      };

      // const txObject = {
      //   from: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
      //   to: "0x499AA73A1D27e54B33E7DB05ffd22854EC70257E",
      //   data: "0xa141c65a00000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000140000000000000000000000000000000000000000000000000000000000000018000000000000000000000000000000000000000000000000000000000000001c00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000002386f26fc1000000000000000000000000000000000000000000000000000000470de4df820000000000000000000000000000000000000000000000000000000000000000000e69757765626a66776566204e4654000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000849555745424e4654000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001069757765626a6677656620546f6b656e0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000084955574542544b4e000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005068747470733a2f2f676174657761792e70696e6174612e636c6f75642f697066732f516d5157375a686647566d595253434a7763704c7965347643476956754e465a7254786b48513657536b444b705900000000000000000000000000000000",
      //   gasLimit: {
      //     type: "BigNumber",
      //     hex: "0x6351",
      //   },
      //   gasPrice: {
      //     type: "BigNumber",
      //     hex: "0x6fc23ac0",
      //   },
      //   nonce: 0,
      //   chainId: 31337,
      // };

      // Make the API call using the Api utility
      const response = await Api.post<{ message: string; data?: any }>(
        "/create-listing", // Endpoint from your curl command, relative to baseURL
        payload,
      );

      console.log("API response:", response?.data);

      // @ts-ignore
      const signTxn = await signAndSendTransaction(window.ethereum, response?.data?.tx);
      // const signTxn = await signAndSendTransaction(window.ethereum, txObject);

      if (signTxn) {
        console.log("transaction signed successfully");
        router.push("/marketplace");
      }

      // Reset form after successful submission
      // reset();
      setImagePreview(null);
    } catch (error: any) {
      console.error("Error submitting form:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/gif"].includes(file.type) || file.size > 2 * 1024 * 1024) {
      setValue("hardwareImage", null);
      return;
    }

    setIsImageLoading(true);

    try {
      // Create FormData for the file upload
      const formData = new FormData();
      formData.append("file", file);

      console.log("making api call to pinata...");

      // Make API call to upload the image using the Api utility
      const response = await Api.post("/upload-to-pinata", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("response api call to pinata...", response);

      // @ts-ignore
      const imageUrl = (response?.data?.pinataUrl as any) ?? "";

      // const imageUrl = "https://gateway.pinata.cloud/ipfs/QmXATY6UTrAV8QpVDvJUmLjoLqpamjE1UVjEtW9BF7Ugwc";
      setImagePreview(imageUrl);
    } catch (error: any) {
      console.error("Error uploading image:", error.message);
      setValue("hardwareImage", null);
      setImagePreview(null);
    } finally {
      setIsImageLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-12">
      <div className="flex items-center justify-center w-full flex-col opacity-0 transform translate-y-10 transition-all duration-1000 ease-out animate-fadeInUp">
        <div style={{ width: "50vw" }}>
          <div className="text-left mb-6">
            <h1 className="text-3xl font-bold">List Your Hardware</h1>
            <p>Fill out the form below to list your computing hardware on the marketplace.</p>
          </div>
          <div className="mx-auto bg-white p-6 rounded-lg shadow-md">
            <div className="mb-4">
              <p className="text-2xl font-bold mb-2">Hardware Details</p>
              <p className="text-md text-gray-600">
                Provide information about your computing hardware. All fields are optional except for the name.
              </p>
            </div>

            {/* Hardware Name */}
            <div className="mb-4">
              <label htmlFor="hardwareName" className="block text-sm font-medium text-gray-700">
                Hardware Name
              </label>
              <Controller
                name="hardwareName"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    id="hardwareName"
                    className={`class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" ${errors.hardwareName ? "border-red-500" : ""}`}
                    placeholder="Nvidia A100"
                  />
                )}
              />
              {errors.hardwareName && <span className="text-red-500 text-xs">{errors.hardwareName.message}</span>}
            </div>

            {/* Instance ID */}
            <div className="mb-4">
              <label htmlFor="hardwareName" className="block text-sm font-medium text-gray-700">
                Instance ID
              </label>
              <Controller
                name="instanceId"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    id="instanceId"
                    className={`class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" ${errors.hardwareName ? "border-red-500" : ""}`}
                    placeholder="i-rtyyx5456"
                  />
                )}
              />
              {errors.hardwareName && <span className="text-red-500 text-xs">{errors.hardwareName.message}</span>}
            </div>

            {/* Tokens and Price */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="totalTokens" className="block text-sm font-medium text-gray-700">
                  Total Tokens
                </label>
                <Controller
                  name="totalTokens"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      id="totalTokens"
                      className={`class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" ${errors.totalTokens ? "border-red-500" : ""}`}
                      placeholder="Total number of tokens to mint."
                      onChange={e => field.onChange(parseFloat(e.target.value) || "")}
                    />
                  )}
                />
                {errors.totalTokens && <span className="text-red-500 text-xs">{errors.totalTokens.message}</span>}
              </div>
              <div>
                <label htmlFor="tokenPrice" className="block text-sm font-medium text-gray-700">
                  Token Price (ETH)
                </label>
                <Controller
                  name="tokenPrice"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      id="tokenPrice"
                      className={`class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" ${errors.tokenPrice ? "border-red-500" : ""}`}
                      placeholder="Initial price per token in USD."
                      onChange={e => field.onChange(e.target.value || "")}
                    />
                  )}
                />
                {errors.tokenPrice && <span className="text-red-500 text-xs">{errors.tokenPrice.message}</span>}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Hardware Image</label>
              <div
                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-md cursor-pointer"
                onClick={() => document.getElementById("hardwareImage")?.click()}
              >
                <div className="space-y-1 text-center w-full">
                  {isImageLoading ? (
                    <div className="flex items-center justify-center w-full h-full">
                      <svg
                        className="animate-spin h-8 w-8 text-gray-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8h8a8 8 0 11-16 0z"
                        ></path>
                      </svg>
                    </div>
                  ) : imagePreview ? (
                    <div className="relative w-full h-full">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-64 w-full rounded-md object-cover cursor-pointer"
                        onClick={() => document.getElementById("hardwareImage")?.click()}
                      />
                      <input
                        id="hardwareImage"
                        type="file"
                        onChange={handleImageChange}
                        className="sr-only"
                        accept="image/png, image/jpeg, image/gif"
                      />
                    </div>
                  ) : (
                    <>
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4 0h-4v4m-12 4h12" />
                      </svg>
                      <div className="text-sm text-gray-600 flex items-center justify-center">
                        <div className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                          <span>Click to upload an image of your hardware</span>
                          <input
                            id="hardwareImage"
                            type="file"
                            onChange={handleImageChange}
                            className="sr-only"
                            accept="image/png, image/jpeg, image/gif"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">JPG, PNG, or GIF up to 5MB</p>
                    </>
                  )}
                </div>
              </div>
              {/* @ts-ignore */}
              {errors.hardwareImage && <span className="text-red-500 text-xs">{errors.hardwareImage.message}</span>}
            </div>

            {/* CPU and Memory */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="cpu" className="block text-sm font-medium text-gray-700">
                  CPU
                </label>
                <Controller
                  name="cpu"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      id="cpu"
                      className={`class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" ${errors.cpu ? "border-red-500" : ""}`}
                      placeholder="Intel i7 quad core"
                    />
                  )}
                />
                {errors.cpu && <span className="text-red-500 text-xs">{errors.cpu.message}</span>}
              </div>
              <div>
                <label htmlFor="memory" className="block text-sm font-medium text-gray-700">
                  Memory
                </label>
                <Controller
                  name="memory"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      id="memory"
                      className={`class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" ${errors.memory ? "border-red-500" : ""}`}
                      placeholder="5GB RAM"
                    />
                  )}
                />
                {errors.memory && <span className="text-red-500 text-xs">{errors.memory.message}</span>}
              </div>
            </div>

            {/* Location */}
            <div className="mb-4">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <Controller
                name="location"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    id="location"
                    className={`class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" ${errors.location ? "border-red-500" : ""}`}
                    placeholder="EU West"
                  />
                )}
              />
              {errors.location && <span className="text-red-500 text-xs">{errors.location.message}</span>}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => reset()}
                className="bg-white text-gray-700 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                // @ts-ignore
                onClick={handleSubmit(onSubmit)}
                className="px-4 py-2 text-white bg-gray-900 rounded hover:bg-gray-800"
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create Listing"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListHardware;
