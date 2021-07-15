'use strict';

angular.module('icestudio')
  .service('drivers', function (gettextCatalog,
    profile,
    common,
    gui,
    utils,
    nodePath,
    nodeSudo,
    nodeChildProcess,
    $rootScope) {

    //--------------------------------------
    //-- Enable de Drivers
    //--
    this.enable = function () {

      //-- The driver depends on the interface of the board
      switch (common.selectedBoard.info.interface) {

        //-- FTDI Boards
        case 'FTDI':
          enableDriversFTDI();
          break;

        //-- Serial boards  
        case 'Serial':
          enableDriversSerial();
          break;

        //-- Board with no interface! (Error!)  
        default:
          console.warn('No valid selected board interface');
      }
    };


    //----------------------------------------------
    //-- Disable the Drivers
    //--
    this.disable = function () {

      //-- It depends on the type of interface of the board
      switch (common.selectedBoard.info.interface) {

        //-- FTDI boards
        case 'FTDI':
          disableDriversFTDI();
          break;

        //-- Serial Boards  
        case 'Serial':
          disableDriversSerial();
          break;

        //-- Board wiht no interface! (Error!)  
        default:
          console.warn('No valid selected board interface');
      }
    };

    //---------------------------------------------
    //-- Enable the drivers for the FTDI boards
    //-- It depends on the operating system
    //--
    function enableDriversFTDI() {

      //-- Enable FTDI on Windows platforms
      if (common.WIN32) {
        enableWindowsDriversFTDI();
      }

      //-- Enable FTDI on MAC
      else if (common.DARWIN) {
        enableDarwinDriversFTDI();
      }

      //-- Enable FTDI on Linux (Default option)
      else {
        enableLinuxDriversFTDI();
      }
    }

    //-----------------------------------------------
    //-- Disable the drivers for the FTDI boards
    //-- It depends on the operating system
    //--
    function disableDriversFTDI() {

      //-- Disable FTDI on windows platforms
      if (common.WIN32) {
        disableWindowsDriversFTDI();
      }

      //-- Disable FTDI on MAC
      else if (common.DARWIN) {
        disableDarwinDriversFTDI();
      }

      //-- Disable FTDI on Linux (Default option)
      else {
        disableLinuxDriversFTDI();
      }
    }

    //----------------------------------------
    //-- Enable the drivers for the serial boards
    //-- It depends on the operating system
    //--
    function enableDriversSerial() {

      //-- Enable the Serial boards on windows
      if (common.WIN32) {
        enableWindowsDriversSerial();
      }

      //-- Enable de Serial boards on MAC
      else if (common.DARWIN) {
        enableDarwinDriversSerial();
      }

      //-- Enable de Serial baords on Linux (Default option)
      else {
        enableLinuxDriversSerial();
      }
    }

    //------------------------------------------------
    //-- Disable the Drivers for the serial boards
    //-- It depends on the operating system
    //-- 
    function disableDriversSerial() {

      //-- Disable the serial boards on windows
      if (common.WIN32) {
        disableWindowsDriversSerial();
      }

      //-- Disable the serial boards on MAC
      else if (common.DARWIN) {
        disableDarwinDriversSerial();
      }

      //-- Disable the serial boards on Linux (default option)
      else {
        disableLinuxDriversSerial();
      }
    }

    
    this.preUpload = function (callback) {
      if (common.DARWIN) {
        preUploadDarwin(callback);
      }
      else if (callback) {
        callback();
      }
    };

    this.postUpload = function () {
      if (common.DARWIN) {
        postUploadDarwin();
      }
    };

    /*
     * Linux drivers
     */

    function enableLinuxDriversFTDI() {
      var rules = '';
      rules += 'ATTRS{idVendor}==\\"0403\\", ATTRS{idProduct}==\\"6010\\", ';
      rules += 'MODE=\\"0660\\", GROUP=\\"plugdev\\", TAG+=\\"uaccess\\"\n';

      rules += 'ATTRS{idVendor}==\\"0403\\", ATTRS{idProduct}==\\"6014\\", ';
      rules += 'MODE=\\"0660\\", GROUP=\\"plugdev\\", TAG+=\\"uaccess\\"\n';

      rules += 'ATTRS{idVendor}==\\"0403\\", ATTRS{idProduct}==\\"6015\\", ';
      rules += 'MODE=\\"0660\\", GROUP=\\"plugdev\\", TAG+=\\"uaccess\\"\n';

      rules += 'ATTRS{idVendor}==\\"1209\\", ATTRS{idProduct}==\\"5af0\\", ';
      rules += 'MODE=\\"0660\\", GROUP=\\"plugdev\\", TAG+=\\"uaccess\\"\n';

      rules += 'ATTRS{idVendor}==\\"1209\\", ATTRS{idProduct}==\\"5bf0\\", ';
      rules += 'MODE=\\"0660\\", GROUP=\\"plugdev\\", TAG+=\\"uaccess\\"\n';

      //-- ulx3s board
      rules += 'ATTRS{idVendor}==\\"0403\\", ATTRS{idProduct}==\\"6015\\", ';
      rules += 'MODE=\\"666\\", GROUP=\\"dialout\\"\n';

      rules += 'ATTRS{idVendor}==\\"0403\\", ATTRS{idProduct}==\\"6015\\", ';
      rules += 'MODE=\\"664\\", GROUP=\\"dialout\\", SUBSYSTEM=="tty"\n';

      //-- Icesugar board
      rules += 'ATTRS{idVendor}==\\"1d50\\", ATTRS{idProduct}==\\"602b\\", ';
      rules += 'MODE=\\"0660\\", GROUP=\\"plugdev\\", TAG+=\\"uaccess\\"\n';

      configureLinuxDrivers([
        'echo \'' + rules + '\' > /etc/udev/rules.d/80-fpga-ftdi.rules'
      ].concat(reloadRules()), function () {
        alertify.success(gettextCatalog.getString('Drivers enabled'));
      });
    }

    function disableLinuxDriversFTDI() {
      configureLinuxDrivers([
        'rm -f /etc/udev/rules.d/80-icestick.rules',
        'rm -f /etc/udev/rules.d/80-fpga-ftdi.rules'
      ].concat(reloadRules()), function () {
        alertify.warning(gettextCatalog.getString('Drivers disabled'));
      });
    }

    function enableLinuxDriversSerial() {
      var rules = '';
      rules += '# Disable ModemManager for BlackIce\n';
      rules += 'ATTRS{idVendor}==\\"0483\\", ATTRS{idProduct}==\\"5740\\", ENV{ID_MM_DEVICE_IGNORE}=\\"1\\"\n';
      rules += '# Disable ModemManager for TinyFPGA B2\n';
      rules += 'ATTRS{idVendor}==\\"1209\\", ATTRS{idProduct}==\\"2100\\", ENV{ID_MM_DEVICE_IGNORE}=\\"1\\"';
      rules += '# Disable ModemManager for TinyFPGA BX\n';
      rules += 'ATTRS{idVendor}==\\"1d50\\", ATTRS{idProduct}==\\"6130\\", ENV{ID_MM_DEVICE_IGNORE}=\\"1\\"';
      rules += '# Disable ModemManager for iceFUN\n';
      rules += 'ATTRS{idVendor}==\\"04d8\\", ATTRS{idProduct}==\\"ffee\\", ENV{ID_MM_DEVICE_IGNORE}=\\"1\\"';
      configureLinuxDrivers([
        'echo \'' + rules + '\' > /etc/udev/rules.d/80-fpga-serial.rules'
      ].concat(reloadRules()), function () {
        alertify.success(gettextCatalog.getString('Drivers enabled'));
      });
    }

    function disableLinuxDriversSerial() {
      configureLinuxDrivers([
        'rm -f /etc/udev/rules.d/80-fpga-serial.rules'
      ].concat(reloadRules()), function () {
        alertify.warning(gettextCatalog.getString('Drivers disabled'));
      });
    }

    function reloadRules() {
      return [
        'udevadm control --reload-rules',
        'udevadm trigger',
        'service udev restart'
      ];
    }

    function configureLinuxDrivers(commands, callback) {
      var command = 'sh -c "' + commands.join('; ') + '"';
      utils.beginBlockingTask();
      nodeSudo.exec(command, { name: 'Icestudio' }, function (error/*, stdout, stderr*/) {
        utils.endBlockingTask();
        if (!error) {
          if (callback) {
            callback();
          }
          setTimeout(function () {
            alertify.message(gettextCatalog.getString('<b>Unplug</b> and <b>reconnect</b> the board'), 5);
          }, 1000);
        }
      });
    }

    /*
     * Darwin drivers
     */

    function enableDarwinDriversFTDI() {
      enableDarwinDrivers(['libftdi', 'libffi'], 'macosFTDIDrivers');
    }

    function disableDarwinDriversFTDI() {
      disableDarwinDrivers('macosFTDIDrivers');
    }

    function enableDarwinDriversSerial() {
      enableDarwinDrivers(['libusb', 'libffi']);
    }

    function disableDarwinDriversSerial() {
      disableDarwinDrivers();
    }

    function enableDarwinDrivers(brewPackages, profileSetting) {
      var brewCommands = [
        '/usr/local/bin/brew update'
      ];
      for (var i in brewPackages) {
        brewCommands = brewCommands.concat(brewInstall(brewPackages[i]));
      }
      utils.beginBlockingTask();
      if (typeof common.DEBUGMODE !== 'undefined' &&
        common.DEBUGMODE === 1) {

        const fs = require('fs');
        fs.appendFileSync(common.LOGFILE, 'drivers.enableDarwinDrivers' + "\n");
      }
      nodeChildProcess.exec(brewCommands.join('; '), function (error, stdout, stderr) {
        if (typeof common.DEBUGMODE !== 'undefined' &&
          common.DEBUGMODE === 1) {
          const fs = require('fs');
          fs.appendFileSync(common.LOGFILE, 'STDERR ' + stderr + "\n");

          fs.appendFileSync(common.LOGFILE, 'STDERR ' + stdout + "\n");
        }
        if (error) {
          if ((stderr.indexOf('brew: command not found') !== -1) ||
            (stderr.indexOf('brew: No such file or directory') !== -1)) {
            alertify.warning(gettextCatalog.getString('{{app}} is required.', { app: '<b>Homebrew</b>' }) + '<br>' +
              '<u>' + gettextCatalog.getString('Click here to install it') + '</u>', 30)
              .callback = function (isClicked) {
                if (isClicked) {
                  gui.Shell.openExternal('https://brew.sh');
                }
              };
          }
          else if (stderr.indexOf('Error: Failed to download') !== -1) {
            alertify.error(gettextCatalog.getString('Internet connection required'), 30);
          }
          else {
            alertify.error(stderr, 30);
          }
        }
        else {
          if (profileSetting) {
            profile.set(profileSetting, true);
          }
          alertify.success(gettextCatalog.getString('Drivers enabled'));
        }
        utils.endBlockingTask();
      });
      if (typeof common.DEBUGMODE !== 'undefined' &&
        common.DEBUGMODE === 1) {
        const fs = require('fs');
        fs.appendFileSync(common.LOGFILE, '/drivers.enableDarwinDrivers' + "\n");

      }
    }

    function disableDarwinDrivers(profileSetting) {
      if (profileSetting) {
        profile.set(profileSetting, false);
      }
      alertify.warning(gettextCatalog.getString('Drivers disabled'));
    }

    function brewInstall(brewPackage) {
      return [
        '/usr/local/bin/brew install --force ' + brewPackage,
        '/usr/local/bin/brew unlink ' + brewPackage,
        '/usr/local/bin/brew link --force ' + brewPackage
      ];
    }

    var driverC = '';

    function preUploadDarwin(callback) {
      if (profile.get('macosFTDIDrivers')) {
        // Check and unload the Drivers
        var driverA = 'com.FTDI.driver.FTDIUSBSerialDriver';
        var driverB = 'com.apple.driver.AppleUSBFTDI';
        if (checkDriverDarwin(driverA)) {
          driverC = driverA;
          processDriverDarwin(driverA, false, callback);
        }
        else if (checkDriverDarwin(driverB)) {
          driverC = driverB;
          processDriverDarwin(driverB, false, callback);
        }
        else {
          driverC = '';
          if (callback) {
            callback();
          }
        }
      }
      else if (callback) {
        callback();
      }
    }

    function postUploadDarwin() {
      if (profile.get('macosFTDIDrivers')) {
        processDriverDarwin(driverC, true);
      }
    }

    function checkDriverDarwin(driver) {
      var output = nodeChildProcess.execSync('kextstat').toString();
      return output.indexOf(driver) > -1;
    }

    function processDriverDarwin(driver, load, callback) {
      if (driver) {
        var command = (load ? 'kextload' : 'kextunload') + ' -b ' + driver;
        nodeSudo.exec(command, { name: 'Icestudio' }, function (/*error, stdout, stderr*/) {
          if (callback) {
            callback();
          }
        });
      }
      else if (callback) {
        callback();
      }
    }

    /*
     * Windows drivers
     */

    function enableWindowsDriversFTDI() {
      var message = gettextCatalog.getString('<h4>FTDI driver installation instructions</h4><ol><li>Connect the FPGA board to the USB and wait until Windows finishes the default installation of the driver</li><li>When the OK button is clicked, the FTDI driver installer will be launched in a new window</li><li>In the installer, replace the <b>(Interface 0)</b> driver of the board by <b>libusbK</b></li><li>Unplug and reconnect the board</li></ol>') + gettextCatalog.getString('It is recommended to use <b>USB 2.0</b> ports');
      alertify.confirm(message, function () {
        enableWindowsDrivers('ftdi');
      });
    }

    function disableWindowsDriversFTDI() {
      var message = gettextCatalog.getString('<h4>FTDI driver uninstallation instructions</h4><ol><li>Find the FPGA USB Device</li><li>Select the board interface and uninstall the driver</li></ol>');
      alertify.confirm(message, function () {
        disableWindowsDrivers('ftdi');
      });
    }

    function enableWindowsDriversSerial() {
      var message = gettextCatalog.getString('<h4>Serial driver installation instructions</h4><ol><li>Connect the FPGA board to the USB and wait until Windows finishes the default installation of the driver</li><li>When the OK button is clicked, the Serial driver installer will be launched in a new window</li><li>In the installer, follow the steps to install the driver</li><li>Unplug and reconnect the board</li></ol>');
      alertify.confirm(message, function () {
        enableWindowsDrivers('serial');
      });
    }

    function disableWindowsDriversSerial() {
      var message = gettextCatalog.getString('<h4>Serial driver uninstallation instructions</h4><ol><li>Find the FPGA USB Device</li><li>Select the board interface and uninstall the driver</li></ol>');
      alertify.confirm(message, function () {
        disableWindowsDrivers('serial');
      });
    }

    function enableWindowsDrivers(type) {
      var option = '--' + type + '-enable';
      utils.beginBlockingTask();
      nodeSudo.exec([common.APIO_CMD, 'drivers', option].join(' '), { name: 'Icestudio' }, function (error, stdout, stderr) {
        utils.endBlockingTask();
        if (stderr) {
          alertify.error(gettextCatalog.getString('Toolchain not installed') + '.<br>' + gettextCatalog.getString('Click here to install it'), 30)
            .callback = function (isClicked) {
              if (isClicked) {
                $rootScope.$broadcast('installToolchain');
              }
            };
        }
        else if (!error) {
          alertify.message(gettextCatalog.getString('<b>Unplug</b> and <b>reconnect</b> the board'), 5);
        }
      });
    }

    function disableWindowsDrivers(type) {
      var option = '--' + type + '-disable';
      utils.beginBlockingTask();
      nodeChildProcess.exec([common.APIO_CMD, 'drivers', option].join(' '), function (error, stdout, stderr) {
        utils.endBlockingTask();
        if (stderr) {
          alertify.error(gettextCatalog.getString('Toolchain not installed') + '.<br>' + gettextCatalog.getString('Click here to install it'), 30)
            .callback = function (isClicked) {
              if (isClicked) {
                $rootScope.$broadcast('installToolchain');
              }
            };
        }
      });
    }

  });
