// Tampilkan tanggal dan waktu
const datetimeEl = document.getElementById("datetime");
setInterval(() => {
  const now = new Date();
  datetimeEl.textContent = now.toLocaleString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}, 1000);

// Lokasi kantor dan radius yang diizinkan
const OFFICE_LATITUDE = -7.56238; // Ganti dengan latitude lokasi kantor
const OFFICE_LONGITUDE = 110.81215; // Ganti dengan longitude lokasi kantor
const ALLOWED_RADIUS = 100; // Radius dalam meter

// Fungsi untuk menghitung jarak menggunakan Haversine Formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Radius bumi dalam meter
  const toRadians = (degree) => (degree * Math.PI) / 180;
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δφ = toRadians(lat2 - lat1);
  const Δλ = toRadians(lon2 - lon1);

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Jarak dalam meter
}

// Validasi lokasi
function isWithinAllowedRadius(userLat, userLon) {
  const distance = calculateDistance(userLat, userLon, OFFICE_LATITUDE, OFFICE_LONGITUDE);
  return distance <= ALLOWED_RADIUS;
}

// Ambil lokasi pengguna
const locationEl = document.getElementById("location");
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      locationEl.textContent = `Lat: ${latitude.toFixed(5)}, Lon: ${longitude.toFixed(5)}`;

      // Tombol Jam Masuk
      masukBtn.addEventListener("click", () => {
        if (isWithinAllowedRadius(latitude, longitude)) {
          savePresensi(datetimeEl.textContent, "-"); // Jam Masuk
        } else {
          alert("Anda berada di luar jangkauan lokasi kantor. Presensi tidak dapat dilakukan.");
        }
      });

      // Tombol Jam Pulang
      pulangBtn.addEventListener("click", () => {
        if (isWithinAllowedRadius(latitude, longitude)) {
          savePresensi("-", datetimeEl.textContent); // Jam Pulang
        } else {
          alert("Anda berada di luar jangkauan lokasi kantor. Presensi tidak dapat dilakukan.");
        }
      });
    },
    (error) => {
      locationEl.textContent = "Gagal mendapatkan lokasi.";
    }
  );
} else {
  locationEl.textContent = "Geolocation tidak didukung di browser ini.";
}

// Akses kamera untuk mengambil selfie
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const selfie = document.getElementById("selfie");
const captureBtn = document.getElementById("capture-btn");
const submitBtn = document.getElementById("submit-btn");
const masukBtn = document.getElementById("masuk-btn");
const pulangBtn = document.getElementById("pulang-btn");

// Akses kamera
navigator.mediaDevices
  .getUserMedia({ video: true })
  .then((stream) => {
    video.srcObject = stream;
  })
  .catch((err) => {
    console.error("Gagal mengakses kamera:", err);
  });

// Ambil foto dari video
captureBtn.addEventListener("click", () => {
  const ctx = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0);
  const selfieData = canvas.toDataURL("image/png");
  selfie.src = selfieData;
  selfie.classList.remove("hidden");
  submitBtn.classList.remove("hidden");
});

// Menyimpan data presensi
function savePresensi(jamMasuk, jamPulang) {
  const presensiData = {
    selfie: selfie.src, // Data gambar dalam format base64
    location: locationEl.textContent,
    datetime: datetimeEl.textContent,
    jamMasuk: jamMasuk || "-",
    jamPulang: jamPulang || "-",
  };

  // Ambil data presensi yang sudah ada di Local Storage
  const existingData = JSON.parse(localStorage.getItem("presensiData")) || [];

  // Tambahkan data baru
  existingData.push(presensiData);

  // Simpan kembali ke Local Storage
  localStorage.setItem("presensiData", JSON.stringify(existingData));

  alert("Presensi berhasil disimpan di Local Storage!");
  displayPresensiData(); // Tampilkan data presensi setelah disimpan
}

// Fungsi untuk menampilkan data presensi dalam bentuk tabel
function displayPresensiData() {
  const data = JSON.parse(localStorage.getItem("presensiData")) || [];
  const tableBody = document.getElementById("presensi-table-body");

  // Kosongkan tabel sebelum menambahkan data terbaru
  tableBody.innerHTML = "";

  data.forEach((item, index) => {
    const row = document.createElement("tr");

    // Buat kolom untuk indeks, tanggal, waktu, lokasi, selfie, jam masuk, dan jam pulang
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${item.datetime}</td>
      <td>${item.location}</td>
      <td><img src="${item.selfie}" alt="Selfie" width="50"></td>
      <td>${item.jamMasuk}</td>
      <td>${item.jamPulang}</td>
    `;

    tableBody.appendChild(row);
  });
}

// Panggil fungsi untuk menampilkan data saat halaman dimuat
window.onload = displayPresensiData;
