import { useEffect, useState } from "react";
import "./App.css";
import berawan from "./img/berawan.jpg";
import cerah from "./img/cerah.jpg";
import hujan from "./img/hujan.jpg";
import lokasiImg from "./img/lokasi.png";

const aboutCuaca = [
  {
    img: "Jarak Pandang",
    name: "Kelembapan",
    value: "0",
  },
  {
    img: "Jarak Pandang",
    name: "Kecepatan Angin",
    value: "0",
  },
  {
    img: "Jarak Pandang",
    name: "Arah Angin Dari",
    value: "0",
  },
  {
    img: "Jarak Pandang",
    name: "Jarak Pandang",
    value: "0",
  },
];

interface Address {
  village: string;
  county: string;
  state: string;
  country: string;
  [key: string]: string;
}

function App() {
  const [myAlamat, setMyAlamat] = useState<Address[]>([]);
  const [latitudeLongitude, setLatitudeLongitude] = useState<any[]>([0, 0]);
  const [locationFetched, setLocationFetched] = useState(false);
  const [kodeWilayahCuaca, setKodeWilayahCuaca] = useState("31.71.01.1001");
  const [dataWilayah, setDataWilayah] = useState<any[]>([]);
  const [dataCuaca, setDataCuaca] = useState<any[]>([]);

  function csvToJson(csv: string) {
    const lines = csv.trim().split("\n");
    const result = [];
    for (let i = 0; i < lines.length; i++) {
      const obj = {};
      const currentLine = lines[i].split(",").map((cell) => cell.trim());
      if (currentLine.length === 1 && currentLine[0] === "") {
        continue;
      }
      obj["kode_wilayah"] = currentLine[0];
      obj["kelurahan"] = currentLine[1];
      result.push(obj);
    }
    return result;
  }
  function findKodeWilayah(inputWilayah: string, dataWilayah: any[]) {
    const result = dataWilayah.find((item) => item.kelurahan === inputWilayah);
    return result ? result.kode_wilayah : "Kode wilayah tidak ditemukan!";
  }

  useEffect(() => {
    if (navigator.geolocation && !locationFetched) {
      navigator.geolocation.getCurrentPosition((position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        setLatitudeLongitude([latitude, longitude]);
        setLocationFetched(true);
      });
    } else if (!navigator.geolocation) {
      console.log("Geolocation is not supported by this browser.");
    }
  }, [locationFetched]);

  useEffect(() => {
    if (!locationFetched) return;
    async function fetchCsv() {
      try {
        // Mengambil data CSV
        const response = await fetch(
          "https://raw.githubusercontent.com/kodewilayah/permendagri-72-2019/main/dist/base.csv"
        );
        const data = await response.text();
        const parsedData = csvToJson(data);
        setDataWilayah(parsedData);

        const responseAlamat = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitudeLongitude[0]}&lon=${latitudeLongitude[1]}&format=json`
        );
        const dataAlamat = await responseAlamat.json();
        const address: Address = dataAlamat.address;
        setMyAlamat([address]);
      } catch (error) {
        console.error("Terjadi kesalahan:", error);
      }
    }

    fetchCsv();
  }, [locationFetched, kodeWilayahCuaca]);

  useEffect(() => {
    if (myAlamat.length === 0) return; // Pastikan myAlamat sudah diupdate
    if (dataWilayah.length === 0) return; // Pastikan dataWilayah sudah tersedia

    const village = myAlamat[0].village;
    const kodeWilayah = findKodeWilayah(village, dataWilayah);
    setKodeWilayahCuaca(kodeWilayah);
  }, [myAlamat, dataWilayah]);

  useEffect(() => {
    async function fetchCuaca() {
      try {
        const response = await fetch(
          `https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${kodeWilayahCuaca}`
        );
        const dataCuaca = await response.json();
        setDataCuaca(dataCuaca.data);
      } catch (error) {
        console.error("Terjadi kesalahan saat mengambil data cuaca:", error);
      }
    }

    fetchCuaca();
  }, [kodeWilayahCuaca]);

  const displayLokasiDesa = document.querySelector(".lokasi-desa");
  const displayLokasiKota = document.querySelector(".lokasi-kota");
  const displayProvinsi = document.querySelector(".lokasi-provinsi");
  const bgweather = document.querySelector(".bg-weather");
  const displayCuaca = document.querySelector(".deskripsi-cuaca");
  const celcius = document.querySelector(".celcius");

  const date = new Date();

  const formattedDate = date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  class Lokasi {
    desa: string;
    kotkab: string;
    provinsi: string;
    constructor(desa: string, kotkab: string, provinsi: string) {
      this.desa = desa;
      this.kotkab = kotkab;
      this.provinsi = provinsi || "Indonesia";
    }

    display() {
      displayLokasiDesa.textContent = this.desa;
      displayLokasiKota.textContent = this.kotkab;
      displayProvinsi.textContent = this.provinsi;
    }
  }

  const dayName: string[] = [
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
    "Minggu",
  ];
  const bulan: string[] = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  class Cuaca {
    protected dataArray: string[];

    constructor(array: string[]) {
      this.dataArray = array;
    }

    tampilkanCuacaHariIni() {
      const dateFull = new Date(); // Buat objek Date
      const hour = dateFull.getHours(); // Ambil jam saat ini

      // Hitung jam terdekat yang merupakan kelipatan 3
      const getHour = Math.ceil(hour / 3) * 3 + 1;

      // Buat objek Date baru dengan jam yang sudah dihitung
      const nowDate = new Date();
      nowDate.setHours(getHour, 0, 0); // Set jam ke kelipatan 3, menit dan detik ke 0

      // Format tanggal dan waktu secara manual
      const year = nowDate.getFullYear();
      const month = String(nowDate.getMonth() + 1).padStart(2, "0");
      const day = String(nowDate.getDate()).padStart(2, "0");
      const hours = String(nowDate.getHours()).padStart(2, "0");
      const minutes = String(nowDate.getMinutes()).padStart(2, "0");
      const seconds = String(nowDate.getSeconds()).padStart(2, "0");

      // Gabungkan menjadi format yang diinginkan
      const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      const dataCuaca = searchInArrays(formattedDate, this.dataArray);
      const { t, hu, weather_desc, ws, wd, tcc } = dataCuaca;
      const deskripsiCuaca = weather_desc.split(" ")[0].toLowerCase();
      console.log(dataCuaca);

      displayCuaca.textContent = weather_desc;
      bgweather.style.backgroundImage = `url('${
        deskripsiCuaca == "hujan"
          ? hujan
          : deskripsiCuaca == "berawan"
          ? berawan
          : cerah
      }')`;

      celcius.textContent = t;
      console.log(this.dataArray);
    }
  }

  function searchInArrays(target, arrays) {
    for (let array of arrays) {
      const foundItem = array.find((item) => item.local_datetime === target);
      if (foundItem) {
        return foundItem;
      }
    }
    return null;
  }
  console.log(dataCuaca);
  if (dataCuaca.length > 0) {
    const data = dataCuaca[0];
    const { cuaca, lokasi } = data;

    const lokasiUser = new Lokasi(lokasi.desa, lokasi.kotkab, lokasi.provinsi);
    lokasiUser.display();

    const cuacaUser = new Cuaca(cuaca);
    cuacaUser.tampilkanCuacaHariIni();
  }

  return (
    <div
      className="bg-weather w-screen h-screen bg-cover bg-center flex-cols center"
      id="demo"
    >
      <div className="gap-2 isolate p-4 aspect-video backdrop-blur-xs w-1/2 rounded-xl bg-white/20 shadow-lg ring-1 ring-black/5 flex-cols text-left">
        <div className="flex-rows gap-2 items-center mb-8">
          <div>
            <img
              id="lokasi-img"
              className="w-12"
              src={lokasiImg}
              alt="Lokasi"
            />
          </div>
          <div>
            <h3 className="font-bold text-4xl">Saat Ini</h3>
            <span className="lokasi-desa text-bold">Nama.Desa</span>,{" "}
            <span className="lokasi-kota">Nama.Kota</span>,{" "}
            <span className="lokasi-provinsi">Nama.Provinsi</span>
          </div>
        </div>
        <div>
          <span className="font-bold text-xl mt-4 ">{formattedDate}</span>
          <h1>
            <span className="celcius">0</span>°C
          </h1>
          <span className="deskripsi-cuaca text-lg font-bold text-gray-600"></span>
        </div>

        <div>
          <ul>
            {aboutCuaca.map((item, index) => (
              <li key={index}>
                <span className="font-bold">{item.name}</span>
                <span> {item.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="perkiraan-cuaca">
        <h1>Perkiraan Cuaca</h1>
        <div className="cuaca-hari-ini">
          <div className="cuaca-hari-ini">
            <span className="cuaca-hari-ini">Cuaca Hari Ini</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
