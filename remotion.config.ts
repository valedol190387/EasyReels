import { Config } from "@remotion/cli/config";

// PNG: кадры идут в кодек без промежуточного сжатия
Config.setVideoImageFormat("png");
Config.setOverwriteOutput(true);
