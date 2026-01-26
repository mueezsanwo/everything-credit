const getEnvironmentVariable = (environmentVariable: string): string => {
  const unvalidatedEnvironmentVariable = process.env[environmentVariable];
  if (!unvalidatedEnvironmentVariable) {
    throw new Error(
      `Couldn't find environment variable: ${environmentVariable}`
    );
  } else {
    return unvalidatedEnvironmentVariable;
  }
};

export const envs = {
//   GOOGLE_CLIENT_SECRET: getEnvironmentVariable("GOOGLE_CLIENT_SECRET"),
//   GOOGLE_CLIENT_ID: getEnvironmentVariable("GOOGLE_CLIENT_ID"),
  //   CLOUDINARY_CLOUD_NAME: getEnvironmentVariable("CLOUDINARY_CLOUD_NAME"),
  //   CLOUDINARY_API_KEY: getEnvironmentVariable("CLOUDINARY_API_KEY"),
  //   CLOUDINARY_API_SECRET: getEnvironmentVariable("CLOUDINARY_API_SECRET"),
  MONGODB_URI: getEnvironmentVariable("MONGODB_URI"),
  JWT_SECRET: getEnvironmentVariable("JWT_SECRET"),
  JWT_EXPIRES_IN: getEnvironmentVariable("JWT_EXPIRES_IN"),
};
