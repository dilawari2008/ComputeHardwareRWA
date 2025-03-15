import AWS from "aws-sdk";
import cron from "node-cron";
import { ethers } from "ethers";
import { CPUMetric } from "@/db/models/cpu-metric";
import { config } from "dotenv";
import { PRICE_ORACLE_ABI } from "@/common/constants/abi/price-oracle.abi";
import { RWADAO_ABI } from "@/common/constants/abi/rwa-dao.abi";
import { Deployment } from "@/db/models/deployment";

// Load environment variables from .env file
config();

// Initialize AWS SSM and CloudWatch clients
const ssm = new AWS.SSM({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const cloudwatch = new AWS.CloudWatch({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Initialize ethers provider and wallet for smart contract interaction
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL); //
const wallet = new ethers.Wallet(
  process.env.ORACLE_PRIVATE_KEY || "",
  provider
);

/**
 * Deploys a bash script to an EC2 instance using AWS SSM.
 * @param instanceId - The ID of the EC2 instance (e.g., "i-0e53cf24601a136fe").
 * @param script - The bash script to deploy as a string.
 * @returns The command ID of the executed SSM command.
 */
export const deployScript = async (instanceId: string, script: string) => {
  console.log(`Starting script deployment to instance: ${instanceId}`);
  console.log(`Script content:\n${script}`);

  const scriptContent = `#!/bin/bash
mkdir -p /home/ubuntu/test
cat << 'EOF' > /home/ubuntu/test/cpu_spike.sh
#!/bin/bash
LOGFILE=/home/ubuntu/test/cpu_spike.log
echo "Starting script at \$(date)" > \$LOGFILE
# Infinite loop to alternate between high and low CPU usage
while true; do
  echo "Starting CPU spike at \$(date)" >> \$LOGFILE
  # High CPU usage for 100 seconds
  START_TIME=\$(date +%s)
  END_TIME=\$((\$START_TIME + 100))
  while [ \$(date +%s) -lt \$END_TIME ]; do
    # Nested loop to burn CPU cycles with minimal memory use
    for ((i=1; i<=1000000; i++)); do
      # Simple arithmetic to keep CPU busy
      result=\$((\$i * \$i))
    done
  done
  echo "Stopping CPU spike at \$(date)" >> \$LOGFILE
  # Low CPU usage (sleep) for 10 seconds
  sleep 10
done
EOF
chmod +x /home/ubuntu/test/cpu_spike.sh
sudo bash /home/ubuntu/test/cpu_spike.sh &>/home/ubuntu/test/cpu_spike_output.log &
echo "CPU spike script deployed and running in background"`;

  script = scriptContent;

  try {
    const params = {
      DocumentName: "AWS-RunShellScript",
      InstanceIds: [instanceId],
      Parameters: {
        commands: [script],
      },
    };

    console.log(`Sending SSM command to instance: ${instanceId}`);
    const response = await ssm.sendCommand(params).promise();

    const commandId = response.Command?.CommandId;
    console.log(`Script deployed successfully with command ID: ${commandId}`);

    return commandId;
  } catch (error) {
    console.error(`Error deploying script to instance ${instanceId}:`, error);
    throw new Error(
      `Failed to deploy script: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Fetches the last 5 minutes of CPU utilization metrics from CloudWatch for an EC2 instance.
 * @param instanceId - The ID of the EC2 instance (e.g., "i-0e53cf24601a136fe").
 * @returns An array of CPU metrics with percentage and timestamp.
 */
export const getCpuMetrics = async (instanceId: string) => {
  console.log(`Fetching CPU metrics for instance: ${instanceId}`);

  const endTime = new Date();
  const startTime = new Date(endTime.getTime() - 5 * 60 * 1000); // 5 minutes ago

  const params = {
    Namespace: "AWS/EC2",
    MetricName: "CPUUtilization",
    Dimensions: [{ Name: "InstanceId", Value: instanceId }],
    StartTime: startTime,
    EndTime: endTime,
    Period: 60, // 1-minute intervals
    Statistics: ["Maximum"],
  };

  try {
    const data = await cloudwatch.getMetricStatistics(params).promise();
    const metrics =
      data.Datapoints?.map((point) => ({
        percentage: point.Maximum || 0,
        timestamp: point.Timestamp || new Date(),
      })) || [];

    console.log(
      `Fetched ${metrics.length} CPU metrics for instance ${instanceId}:`,
      metrics
    );
    return metrics;
  } catch (error) {
    console.error(
      `Error fetching CPU metrics for instance ${instanceId}:`,
      error
    );
    return [];
  }
};

/**
 * Stores CPU metrics in the MongoDB `CpuMetrics` collection.
 * @param daoAddress - The DAO address associated with the metrics.
 * @param metrics - Array of CPU metrics to store.
 */
export const storeCpuMetrics = async (
  daoAddress: string,
  metrics: { percentage: number; timestamp: Date }[]
) => {
  console.log(`Storing ${metrics.length} CPU metrics for DAO: ${daoAddress}`);

  try {
    const metricDoc = await CPUMetric.findOne({ daoAddress });

    if (metricDoc) {
      await CPUMetric.updateOne(
        { daoAddress },
        { $push: { cpuUtilization: { $each: metrics } } }
      );
      console.log(`Updated existing CPU metrics for DAO: ${daoAddress}`);
    } else {
      await CPUMetric.create({
        daoAddress,
        cpuUtilization: metrics,
      });
      console.log(`Created new CPU metrics document for DAO: ${daoAddress}`);
    }
  } catch (error) {
    console.error(`Error storing CPU metrics for DAO ${daoAddress}:`, error);
  }
};

/**
 * Sends CPU metrics to the PriceOracle smart contract.
 * @param daoAddress - The DAO address (used to derive the PriceOracle address if needed).
 * @param metrics - Array of CPU metrics to send.
 * @param priceOracleAddress - The address of the PriceOracle contract.
 */
export const updatePriceOracle = async (
  daoAddress: string,
  metrics: { percentage: number; timestamp: Date }[],
  priceOracleAddress: string
) => {
  console.log(
    `Updating PriceOracle at ${priceOracleAddress} with ${metrics.length} metrics for DAO: ${daoAddress}`
  );

  try {
    const priceOracleContract = new ethers.Contract(
      priceOracleAddress,
      PRICE_ORACLE_ABI,
      wallet
    );

    for (const metric of metrics) {
      console.log(
        `Sending metric: ${metric.percentage}% at ${metric.timestamp} to PriceOracle`
      );
      const tx = await priceOracleContract.addMetric(
        Math.round(metric.percentage),
        Math.floor(metric.timestamp.getTime() / 1000)
      );
      await tx.wait();
      console.log(`Transaction confirmed for metric: ${metric.percentage}%`);
    }
  } catch (error) {
    console.error(`Error updating PriceOracle for DAO ${daoAddress}:`, error);
  }
};

/**
 * Initializes a cron job to fetch CPU metrics every 5 minutes, store them in MongoDB,
 * and send them to the PriceOracle contract.
 */
const initializeMetricsCollection = () => {
  console.log("Initializing CPU metrics collection cron job");

  cron.schedule("*/1 * * * *", async () => {
    console.log("Starting CPU metrics collection cron job");

    try {
      // Get all deployments from the database
      const allDeployments = await Deployment.find({}).exec();
      console.log(`Found ${allDeployments.length} deployments to process`);

      // Process each deployment
      for (const deployment of allDeployments) {
        const { instanceId, daoAddress } = deployment;

        if (!instanceId || !daoAddress) {
          console.log(
            `Skipping deployment with missing data: ${deployment._id}`
          );
          continue;
        }

        console.log(
          `Processing metrics for instance: ${instanceId}, DAO: ${daoAddress}`
        );

        // Get the PriceOracle address for this DAO
        const daoContract = new ethers.Contract(
          daoAddress,
          RWADAO_ABI,
          provider
        );
        let priceOracleAddress;

        try {
          priceOracleAddress = await daoContract.priceOracle();
        } catch (error) {
          console.error(
            `Error getting priceOracle for DAO ${daoAddress}:`,
            error
          );
          continue;
        }

        if (!priceOracleAddress) {
          console.log(`No PriceOracle address found for DAO: ${daoAddress}`);
          continue;
        }

        // Fetch CPU metrics
        const metrics = await getCpuMetrics(instanceId);

        if (metrics.length > 0) {
          // Store metrics in database
          await storeCpuMetrics(daoAddress, metrics);

          // Update PriceOracle contract
          await updatePriceOracle(daoAddress, metrics, priceOracleAddress);
          console.log(`Completed metrics processing for DAO: ${daoAddress}`);
        } else {
          console.log(`No CPU metrics fetched for instance: ${instanceId}`);
        }
      }

      console.log("Completed CPU metrics collection cycle");
    } catch (error) {
      console.error("Error in metrics collection job:", error);
    }
  });

  console.log("Cron job scheduled to run every 5 minutes");
};

// Start the cron job
// initializeMetricsCollection();

const DeploymentService = {
  deployScript,
};

export default DeploymentService;
