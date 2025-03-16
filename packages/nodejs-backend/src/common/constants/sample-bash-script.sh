#!/bin/bash
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
echo "CPU spike script deployed and running in background"