import { downloadImage } from "../server/utils/image";

const main = async () => {
  await downloadImage(
    "https://i1-dulich.vnecdn.net/2022/06/21/dao-Co-To-01-9882-1655807499.jpg?w=0&h=0&q=100&dpr=1&fit=crop&s=-Ukv4vk3gOBa_S5UYRzU-w",
    "test",
    "image-1"
  );
};

main();
