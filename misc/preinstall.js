if (process.env.npm_execpath.indexOf('npm') === -1) {
  throw new Error(`

  ################################################
  #                                              #
  #  Please use NPM > 6 to install dependencies  #
  #                                              #
  ################################################
  `);
}
