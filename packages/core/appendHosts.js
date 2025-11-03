const fs = require('fs');
const os = require('os');
const path = require('path');

// Windows hosts file path
const hostsPath = path.join(os.type() === 'Windows_NT' ? 'C:\\Windows\\System32\\drivers\\etc\\hosts' : '/etc/hosts');
const hostnameToAdd = '127.0.0.1 localhost.binary.sx';

console.log('Checking hosts file at:', hostsPath);

try {
  // Check if we can read the hosts file
  if (fs.existsSync(hostsPath)) {
    const data = fs.readFileSync(hostsPath, 'utf8');
    if (data.includes(hostnameToAdd)) {
      console.log('Hostname already exists in hosts file');
    } else {
      console.log('Note: To enable full functionality, add this line to your hosts file:');
      console.log(hostnameToAdd);
      console.log('Location:', hostsPath);
      console.log('(Run as administrator to modify)');
    }
  } else {
    console.log('Hosts file not found. Manual entry may be required:');
    console.log(hostnameToAdd);
  }
} catch (err) {
  console.log('Unable to access hosts file (permission issue). For full functionality, manually add:');
  console.log(hostnameToAdd);
  console.log('to your hosts file at:', hostsPath);
}

// Don't fail the build if hosts modification fails
console.log('Continuing with build...');