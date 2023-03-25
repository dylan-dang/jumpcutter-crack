# JC-crack

JC-crack is a Windows CLI tool to automatically download, install, and crack the latest version of [JumpCutter](https://jumpcutter.com/), the autonomous video editor created by Carykh and the JumpCutter team. Through JC-crack, you can enjoy the full features of JumpCutter without subscribing or ever creating an account.

## Installation and Usage

To start off, you should already have [NodeJS](https://nodejs.org) installed. Then, download the dependencies using your package manager of choice. An example of how to do so is shown below using [pnpm](https://pnpm.io), but you may subsitute any instance of `pnpm` with `npm` to get to achieve the same results.

```bash
pnpm i
```

Next, start the script by running

```bash
pnpm start
```

If you already have JumpCutter installed, JC-crack will detect and crack your current installation. However, be sure that JumpCutter is on the latest version, or else the crack will be overwritten by the updater on the next launch. JC-crack can also download and install the latest version JumpCutter automatically for you. You also have the option of using a locally downloaded version of the setup executable as long as it is in the same directory.

## Afterword

After every JumpCutter update, JC-crack will be overwritten and will have to be reinstalled. JC-crack will not be guaranteed to work for future versions to JumpCutter as updates roll out, as JumpCutter is early in its beta. As such, JC-crack is meant to be used for educational purposes only. To avoid these hassles, the best way to experience JumpCutter is through an official [JumpCutter subscription](https://jumpcutter.com/pricing), which also provides a gracious 2 week free trial.

## License

JC-crack is MIT Licensed.
