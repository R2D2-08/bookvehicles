import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-gray-50">
      <section className="flex flex-col md:flex-row items-center gap-8 p-8 max-w-5xl w-full">
        <div className="text-center md:text-left flex flex-col gap-4">
          <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">
            Login and book a cab of your choice
          </h1>
          <p className="text-lg text-gray-700">
            View past trips, tailored suggestions, support resources, and more.
          </p>
          <button className="w-full md:w-auto rounded-xl text-white bg-black py-3 px-6 text-lg font-semibold hover:bg-gray-900 transition">
            Login
          </button>
        </div>
        <div className="relative w-96 h-64 md:w-[500px] md:h-[300px] overflow-hidden shadow-xl">
          <Image
            src="/images/ride_sharing_scene.jpg"
            alt="Ride Sharing Scene"
            layout="fill"
            objectFit="cover"
          />
        </div>
      </section>
    </div>
  );
}
