# #!/bin/bash
# # Update and install Docker if not installed
# sudo apt-get update
# sudo apt-get install -y docker.io

# # Pull the CPU stress test image
# sudo docker pull progrium/stress

# # Run the stress test with extreme fluctuations on a single core machine
# while true; do
#   # 100% CPU utilization for 1 minute
#   sudo docker run --rm -d --name cpu-stress progrium/stress --cpu 1 --timeout 60s
#   sleep 60
#   sudo docker stop cpu-stress || true
  
#   # 0% utilization for 30 seconds (just sleep)
#   sleep 30
# done

#!/bin/bash
# Log file
LOGFILE=/home/ubuntu/test/cpu_spike.log
echo "Starting script at $(date)" > $LOGFILE
# Infinite loop to alternate between high and low CPU usage
while true; do
  echo "Starting CPU spike at $(date)" >> $LOGFILE
  # High CPU usage for 100 seconds
  START_TIME=$(date +%s)
  END_TIME=$(($START_TIME + 100))
  while [ $(date +%s) -lt $END_TIME ]; do
    # Nested loop to burn CPU cycles with minimal memory use
    for ((i=1; i<=1000000; i++)); do
      # Simple arithmetic to keep CPU busy
      result=$(($i * $i))
    done
  done
  echo "Stopping CPU spike at $(date)" >> $LOGFILE
  # Low CPU usage (sleep) for 10 seconds
  sleep 10
done




#!/bin/bash
# Create directory and log file as ubuntu user
mkdir -p /home/ubuntu/test
echo "Starting script at $(date)" > /home/ubuntu/test/cpu_spike.log
# Run the CPU spike script in the background with nohup
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
nohup /home/ubuntu/test/cpu_spike.sh &>/home/ubuntu/test/cpu_spike_output.log &
echo "Script deployed and running in background"