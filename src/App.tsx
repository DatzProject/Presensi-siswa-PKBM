import React, { useState, useEffect, useRef } from "react";

const ENDPOINT =
  "https://script.google.com/macros/s/AKfycbwILTEOufB7W8ov71JUDLytlDSCF4SAaPyxrx4CUy-TVaGhlauDmSZZhkNqWl0-bUBBcg/exec";

interface Attendance {
  id: number;
  date: string;
  time: string;
  class: string;
  name: string;
  nisn: string;
  photo: string | null;
  status: string;
}

interface StudentData {
  nisn: string;
  name: string;
  class: string;
}

interface TeacherData {
  nip: string;
  name: string;
}

interface KepsekData {
  nomorinduk: string;
  name: string;
}

interface FormState {
  date: string;
  time: string;
  class: string;
  name: string;
  nisn: string;
  photo: string | null;
  photoBase64: string | null;
  error: string;
  loading: boolean;
}

interface TeacherAttendanceFormState {
  date: string;
  time: string;
  class: string;
  name: string;
  nisn: string;
  status: string;
  error: string;
  loading: boolean;
}

interface TeacherManagementFormState {
  nip: string;
  name: string;
  error: string;
  loading: boolean;
}

interface StudentFormState {
  nisn: string;
  name: string;
  class: string;
  error: string;
  loading: boolean;
}

interface LoginFormState {
  role: "Guru" | "Siswa" | "Kepala Sekolah" | "";
  name: string;
  idNumber: string;
  error: string;
  loading: boolean;
}

interface ProcessedAttendance extends Attendance {
  processedPhoto?: string | null;
}

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<
    "Guru" | "Siswa" | "Kepala Sekolah" | null
  >(null);
  const [currentPage, setCurrentPage] = useState<
    "form" | "data" | "students" | "teacherForm" | "teacherData"
  >("form");
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [attendanceData, setAttendanceData] = useState<Attendance[]>([]);
  const [studentData, setStudentData] = useState<StudentData[]>([]);
  const [teacherData, setTeacherData] = useState<TeacherData[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormState>({
    date: "",
    time: "",
    class: "",
    name: "",
    nisn: "",
    photo: null,
    photoBase64: null,
    error: "",
    loading: false,
  });
  const [teacherForm, setTeacherForm] = useState<TeacherAttendanceFormState>({
    date: "",
    time: "",
    class: "",
    name: "",
    nisn: "",
    status: "Hadir",
    error: "",
    loading: false,
  });
  const [studentForm, setStudentForm] = useState<StudentFormState>({
    nisn: "",
    name: "",
    class: "",
    error: "",
    loading: false,
  });
  const [loginForm, setLoginForm] = useState<LoginFormState>({
    role: "",
    name: "",
    idNumber: "",
    error: "",
    loading: false,
  });
  const [editStudent, setEditStudent] = useState<StudentData | null>(null);
  const [deleteStudentNisn, setDeleteStudentNisn] = useState<string | null>(
    null
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");

  const [showClearAttendanceModal, setShowClearAttendanceModal] =
    useState(false);

  const [kepsekData, setKepsekData] = useState<KepsekData[]>([]);
  const [teacherFormState, setTeacherFormState] =
    useState<TeacherManagementFormState>({
      nip: "",
      name: "",
      error: "",
      loading: false,
    });
  const [editTeacher, setEditTeacher] = useState<TeacherData | null>(null);
  const [deleteTeacherNip, setDeleteTeacherNip] = useState<string | null>(null);
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [showEditTeacherModal, setShowEditTeacherModal] = useState(false);
  const [showDeleteTeacherModal, setShowDeleteTeacherModal] = useState(false);

  useEffect(() => {
    const now = new Date(); // Ambil waktu saat ini
    const witaDate = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Makassar" })
    ); // Pakai WITA eksplisit
    const date = witaDate.toISOString().split("T")[0];
    const time = witaDate
      .toLocaleTimeString("en-GB", { timeZone: "Asia/Makassar", hour12: false })
      .slice(0, 8); // HH:MM:SS

    // Ambil waktu terakhir dari localStorage jika ada
    const lastLogoutTime = localStorage.getItem("lastLogoutTime");
    const initialTime = lastLogoutTime || time;

    setForm(
      (prev: FormState): FormState => ({ ...prev, date, time: initialTime })
    );
    setTeacherForm(
      (prev: TeacherAttendanceFormState): TeacherAttendanceFormState => ({
        ...prev,
        date,
        time: initialTime,
      })
    );

    // Fungsi untuk mengambil data
    const fetchData = async () => {
      try {
        const [studentResponse, teacherResponse, kepsekResponse] =
          await Promise.all([
            fetch(`${ENDPOINT}?action=getStudentData`),
            fetch(`${ENDPOINT}?action=getTeacherData`),
            fetch(`${ENDPOINT}?action=getKepsekData`),
          ]);

        if (studentResponse.ok) {
          const studentData = await studentResponse.json();
          console.log("Student data:", studentData);
          setStudentData(studentData.success ? studentData.data : []);
        }

        if (teacherResponse.ok) {
          const teacherData = await teacherResponse.json();
          console.log("Teacher data:", teacherData);
          setTeacherData(teacherData.success ? teacherData.data : []);
        }

        if (kepsekResponse.ok) {
          const kepsekData = await kepsekResponse.json();
          console.log("Kepsek response:", kepsekResponse);
          console.log("Kepsek data:", kepsekData);
          setKepsekData(kepsekData.success ? kepsekData.data : []);
        } else {
          console.error("Kepsek response not ok:", kepsekResponse.status);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    // Panggil fungsi fetchData saat komponen dimuat
    fetchData();

    // Fungsi untuk memperbarui waktu secara real-time
    const interval = setInterval(() => {
      const now = new Date();
      const witaDate = new Date(
        now.toLocaleString("en-US", { timeZone: "Asia/Makassar" })
      );
      const time = witaDate
        .toLocaleTimeString("en-GB", {
          timeZone: "Asia/Makassar",
          hour12: false,
        })
        .slice(0, 8); // HH:MM:SS
      setForm((prev: FormState): FormState => ({ ...prev, time }));
      setTeacherForm(
        (prev: TeacherAttendanceFormState): TeacherAttendanceFormState => ({
          ...prev,
          time,
        })
      );
    }, 1000); // Perbarui setiap 1 detik

    // Bersihkan interval dan resource saat komponen unmount
    return () => {
      clearInterval(interval);
      if (form.photo) {
        URL.revokeObjectURL(form.photo);
      }
    };
  }, []);

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${ENDPOINT}?action=getAttendanceData`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAttendanceData(data.data);
        } else {
          console.error("Error fetching attendance data:", data.error);
        }
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherFormInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setTeacherFormState((prev: TeacherManagementFormState) => ({
      ...prev,
      [name]: value,
      error: "",
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev: FormState): FormState => {
      const updatedForm = { ...prev, [name]: value, error: "" };
      if (name === "name") {
        const selectedStudent = studentData.find((s) => s.name === value);
        if (selectedStudent) {
          updatedForm.nisn = selectedStudent.nisn;
          if (
            updatedForm.class &&
            updatedForm.class !== selectedStudent.class
          ) {
            updatedForm.error = "Kelas tidak sesuai dengan data siswa";
          }
        } else if (updatedForm.class) {
          updatedForm.error = "Nama tidak ditemukan dalam kelas yang dipilih";
        }
      } else if (name === "class") {
        updatedForm.name = "";
        updatedForm.nisn = "";
        const validClass = studentData.some((s) => s.class === value);
        if (!validClass && value) {
          updatedForm.error = "Kelas tidak valid";
        }
      }
      return updatedForm;
    });
  };

  const handleTeacherInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // 🎯 BAGIAN BARU: Jika yang dipilih adalah nama siswa
    if (name === "name") {
      console.log("Nama yang dipilih:", value);
      console.log("Kelas saat ini:", teacherForm.class);

      // Cari siswa berdasarkan nama dan kelas
      const siswaYangDipilih = studentData.find(
        (siswa) => siswa.name === value && siswa.class === teacherForm.class
      );

      console.log("Siswa ditemukan:", siswaYangDipilih);

      // Update form dengan nama dan NISN
      setTeacherForm(
        (prev: TeacherAttendanceFormState): TeacherAttendanceFormState => ({
          ...prev,
          name: value, // Isi nama
          nisn: siswaYangDipilih ? siswaYangDipilih.nisn : "", // Isi NISN otomatis
          error: "",
        })
      );
    }
    // 🎯 BAGIAN BARU: Jika yang dipilih adalah kelas
    else if (name === "class") {
      // Reset nama dan NISN ketika kelas berubah
      setTeacherForm(
        (prev: TeacherAttendanceFormState): TeacherAttendanceFormState => ({
          ...prev,
          class: value,
          name: "", // Kosongkan nama
          nisn: "", // Kosongkan NISN
          error: "",
        })
      );
    }
    // 🎯 Untuk field lainnya (status, dll), update seperti biasa
    else {
      setTeacherForm(
        (prev: TeacherAttendanceFormState): TeacherAttendanceFormState => ({
          ...prev,
          [name]: value,
          error: "",
        })
      );
    }
  };

  const handleStudentInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStudentForm(
      (prev: StudentFormState): StudentFormState => ({
        ...prev,
        [name]: value,
        error: "",
      })
    );
  };

  const handleLoginInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setLoginForm((prev) => {
      const updatedForm = { ...prev, [name]: value, error: "" };
      if (name === "role") {
        updatedForm.name = "";
        updatedForm.idNumber = "";
      }
      return updatedForm;
    });
  };

  const handleLogin = async () => {
    if (!loginForm.role || !loginForm.name || !loginForm.idNumber) {
      setLoginForm((prev) => ({
        ...prev,
        error: "Harap lengkapi semua field",
      }));
      return;
    }

    setLoginForm((prev) => ({ ...prev, loading: true, error: "" }));

    let isValid = false;
    if (loginForm.role === "Guru") {
      isValid = teacherData.some(
        (item) =>
          item.name === loginForm.name && item.nip === loginForm.idNumber
      );
    } else if (loginForm.role === "Siswa") {
      isValid = studentData.some(
        (item) =>
          item.name === loginForm.name && item.nisn === loginForm.idNumber
      );
    } else if (loginForm.role === "Kepala Sekolah") {
      // Tambahkan ini
      isValid = kepsekData.some(
        (item) =>
          item.name === loginForm.name && item.nomorinduk === loginForm.idNumber
      );
    }

    if (isValid) {
      setIsLoggedIn(true);
      setUserRole(loginForm.role);
      setCurrentPage(loginForm.role === "Siswa" ? "form" : "teacherForm");

      // If student, pre-fill the form with their details
      if (loginForm.role === "Siswa") {
        setCurrentPage("form");
        // Pre-fill form untuk siswa (kode existing)
        const selectedStudent = studentData.find(
          (s) => s.name === loginForm.name && s.nisn === loginForm.idNumber
        );
        if (selectedStudent) {
          setForm((prev) => ({
            ...prev,
            name: selectedStudent.name,
            nisn: selectedStudent.nisn,
            class: selectedStudent.class,
            error: "",
          }));
        }
      } else if (loginForm.role === "Guru") {
        setCurrentPage("teacherForm");
      } else if (loginForm.role === "Kepala Sekolah") {
        // Tambahkan ini
        setCurrentPage("teacherData");
      }

      setLoginForm({
        role: "",
        name: "",
        idNumber: "",
        error: "",
        loading: false,
      });
    } else {
      setLoginForm((prev) => ({
        ...prev,
        error: "Nama atau Nomor Induk tidak valid",
        loading: false,
      }));
    }
  };

  const compressImage = (
    file: File,
    targetSizeMB: number = 0.8
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context not supported"));
          return;
        }

        let width = img.width;
        let height = img.height;
        const MAX_DIMENSION = 1280;

        if (width > height && width > MAX_DIMENSION) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else if (height > MAX_DIMENSION) {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.7;
        const minQuality = 0.1;
        const step = 0.1;
        const targetSizeBytes = targetSizeMB * 1024 * 1024;

        const tryCompress = () => {
          const dataUrl = canvas.toDataURL("image/jpeg", quality);
          const base64 = dataUrl.split(",").slice(-1)[0];
          const byteLength = Math.round((base64.length * 3) / 4);

          if (byteLength <= targetSizeBytes || quality <= minQuality) {
            resolve(base64);
          } else {
            quality -= step;
            setTimeout(tryCompress, 0);
          }
        };

        tryCompress();
      };

      img.onerror = reject;
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setForm(
          (prev: FormState): FormState => ({
            ...prev,
            error: "File harus berupa gambar",
          })
        );
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setForm(
          (prev: FormState): FormState => ({
            ...prev,
            error: "Ukuran file maksimal 10MB",
          })
        );
        return;
      }

      try {
        setForm(
          (prev: FormState): FormState => ({
            ...prev,
            loading: true,
            error: "Memproses gambar...",
          })
        );

        const base64 = await compressImage(file, 0.8);
        const compressedSizeKB = Math.round((base64.length * 3) / 4 / 1024);
        console.log(`Ukuran gambar setelah kompresi: ${compressedSizeKB} KB`);

        const photoURL = URL.createObjectURL(file);

        setForm(
          (prev: FormState): FormState => ({
            ...prev,
            photo: photoURL,
            photoBase64: base64,
            error: "",
            loading: false,
          })
        );

        event.target.value = "";
      } catch (error) {
        console.error("Error processing file:", error);
        setForm(
          (prev: FormState): FormState => ({
            ...prev,
            error:
              "Gagal memproses file. Coba gunakan gambar yang lebih kecil.",
            loading: false,
          })
        );
      }
    }
  };

  const openCameraApp = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const retakePhoto = () => {
    if (form.photo) {
      URL.revokeObjectURL(form.photo);
    }

    setForm(
      (prev: FormState): FormState => ({
        ...prev,
        photo: null,
        photoBase64: null,
        error: "",
      })
    );

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!form.class || !form.name || !form.nisn) {
      setForm(
        (prev: FormState): FormState => ({
          ...prev,
          error: "Harap lengkapi semua field yang diperlukan",
        })
      );
      return;
    }

    const selectedStudent = studentData.find(
      (s) => s.name === form.name && s.nisn === form.nisn
    );
    if (selectedStudent && form.class !== selectedStudent.class) {
      setForm(
        (prev: FormState): FormState => ({
          ...prev,
          error: "Kelas tidak sesuai dengan data siswa",
        })
      );
      return;
    }

    if (!form.photoBase64) {
      setForm(
        (prev: FormState): FormState => ({
          ...prev,
          error: "Harap unggah foto terlebih dahulu",
        })
      );
      return;
    }

    setForm(
      (prev: FormState): FormState => ({
        ...prev,
        loading: true,
        error: "",
      })
    );

    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: form.date,
          time: form.time,
          class: form.class,
          name: form.name,
          nisn: form.nisn,
          photo: form.photoBase64,
          status: "Hadir",
        }),
      });

      console.log("Response type:", response.type);

      if (response.type === "opaque") {
        const newAttendance: Attendance = {
          id: attendances.length + 1,
          date: form.date,
          time: form.time,
          class: form.class,
          name: form.name,
          nisn: form.nisn,
          photo: form.photo,
          status: "Hadir",
        };
        setAttendances((prev) => [...prev, newAttendance]);

        if (form.photo) {
          URL.revokeObjectURL(form.photo);
        }
        setForm(
          (prev: FormState): FormState => ({
            ...prev,
            class: "",
            name: "",
            nisn: "",
            photo: null,
            photoBase64: null,
            error: "",
            loading: false,
          })
        );

        console.log("Absensi berhasil disimpan!");
        alert("Absensi berhasil disimpan!");
      } else {
        throw new Error("Unexpected response type");
      }
    } catch (error: any) {
      console.error("Error detail:", error);

      try {
        console.log("Mencoba metode alternatif...");
        const params = new URLSearchParams({
          action: "addAttendance",
          date: form.date,
          time: form.time,
          class: form.class,
          name: form.name,
          nisn: form.nisn,
          photo: form.photoBase64.substring(0, 1000) + "...",
          status: "Hadir",
        });

        const alternativeResponse = await fetch(`${ENDPOINT}?${params}`, {
          method: "GET",
          mode: "no-cors",
        });

        console.log("Alternative response:", alternativeResponse);
        alert("Data berhasil dikirim dengan metode alternatif!");

        if (form.photo) {
          URL.revokeObjectURL(form.photo);
        }
        setForm(
          (prev: FormState): FormState => ({
            ...prev,
            class: "",
            name: "",
            nisn: "",
            photo: null,
            photoBase64: null,
            error: "",
            loading: false,
          })
        );
      } catch (altError) {
        console.error("Alternative method error:", altError);
        setForm(
          (prev: FormState): FormState => ({
            ...prev,
            error: `Gagal menyimpan data. Pastikan:\n1. Koneksi internet stabil\n2. Google Apps Script dapat diakses\n3. Ukuran foto tidak terlalu besar\n\nError: ${error.message}`,
            loading: false,
          })
        );
      }
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setCurrentPage("form");

    // Dapatkan tanggal dan jam saat ini
    const now = new Date();
    const currentDate = now.toISOString().split("T")[0]; // Format: YYYY-MM-DD
    const currentTime = now.toTimeString().slice(0, 5); // Format: HH:MM

    // Reset form dengan tanggal dan jam realtime
    setForm({
      date: currentDate, // Set ke tanggal saat ini
      time: currentTime, // Set ke jam saat ini
      class: "",
      name: "",
      nisn: "",
      photo: null,
      photoBase64: null,
      error: "",
      loading: false,
    });

    setTeacherForm({
      date: currentDate, // Set ke tanggal saat ini
      time: currentTime, // Set ke jam saat ini
      class: "",
      name: "",
      nisn: "",
      status: "Hadir",
      error: "",
      loading: false,
    });

    alert("Anda telah logout.");
  };

  const handleTeacherSubmit = async () => {
    if (
      !teacherForm.class ||
      !teacherForm.name ||
      !teacherForm.nisn ||
      !teacherForm.status
    ) {
      setTeacherForm(
        (prev: TeacherAttendanceFormState): TeacherAttendanceFormState => ({
          ...prev,
          error: "Harap lengkapi semua field yang diperlukan",
        })
      );
      return;
    }

    const selectedStudent = studentData.find(
      (s) => s.name === teacherForm.name && s.nisn === teacherForm.nisn
    );
    if (selectedStudent && teacherForm.class !== selectedStudent.class) {
      setTeacherForm(
        (prev: TeacherAttendanceFormState): TeacherAttendanceFormState => ({
          ...prev,
          error: "Kelas tidak sesuai dengan data siswa",
        })
      );
      return;
    }

    setTeacherForm(
      (prev: TeacherAttendanceFormState): TeacherAttendanceFormState => ({
        ...prev,
        loading: true,
        error: "",
      })
    );

    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: teacherForm.date,
          time: teacherForm.time,
          class: teacherForm.class,
          name: teacherForm.name,
          nisn: teacherForm.nisn,
          status: teacherForm.status,
        }),
      });

      console.log("Response type:", response.type);

      if (response.type === "opaque") {
        const newAttendance: Attendance = {
          id: attendances.length + 1,
          date: teacherForm.date,
          time: teacherForm.time,
          class: teacherForm.class,
          name: teacherForm.name,
          nisn: teacherForm.nisn,
          photo: null,
          status: teacherForm.status,
        };
        setAttendances((prev) => [...prev, newAttendance]);

        setTeacherForm(
          (prev: TeacherAttendanceFormState): TeacherAttendanceFormState => ({
            ...prev,
            class: "",
            name: "",
            nisn: "",
            status: "Hadir",
            error: "",
            loading: false,
          })
        );

        console.log("Absensi berhasil disimpan!");
        alert("Absensi berhasil disimpan!");
      } else {
        throw new Error("Unexpected response type");
      }
    } catch (error: any) {
      console.error("Error detail:", error);

      try {
        console.log("Mencoba metode alternatif...");
        const params = new URLSearchParams({
          action: "addAttendance",
          date: teacherForm.date,
          time: teacherForm.time,
          class: teacherForm.class,
          name: teacherForm.name,
          nisn: teacherForm.nisn,
          status: teacherForm.status,
        });

        const alternativeResponse = await fetch(`${ENDPOINT}?${params}`, {
          method: "GET",
          mode: "no-cors",
        });

        console.log("Alternative response:", alternativeResponse);
        alert("Data berhasil dikirim dengan metode alternatif!");

        setTeacherForm(
          (prev: TeacherAttendanceFormState): TeacherAttendanceFormState => ({
            ...prev,
            class: "",
            name: "",
            nisn: "",
            status: "Hadir",
            error: "",
            loading: false,
          })
        );
      } catch (altError) {
        console.error("Alternative method error:", altError);
        setTeacherForm(
          (prev: TeacherAttendanceFormState): TeacherAttendanceFormState => ({
            ...prev,
            error: `Gagal menyimpan data. Pastikan:\n1. Koneksi internet stabil\n2. Google Apps Script dapat diakses\n\nError: ${error.message}`,
            loading: false,
          })
        );
      }
    }
  };

  const handleAddStudent = async () => {
    if (!studentForm.nisn || !studentForm.name || !studentForm.class) {
      setStudentForm(
        (prev: StudentFormState): StudentFormState => ({
          ...prev,
          error: "Harap lengkapi semua field",
        })
      );
      return;
    }

    if (studentData.some((s) => s.nisn === studentForm.nisn)) {
      setStudentForm(
        (prev: StudentFormState): StudentFormState => ({
          ...prev,
          error: "NISN sudah ada",
        })
      );
      return;
    }

    setStudentForm(
      (prev: StudentFormState): StudentFormState => ({
        ...prev,
        loading: true,
        error: "",
      })
    );

    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "addStudent",
          nisn: studentForm.nisn,
          name: studentForm.name,
          class: studentForm.class,
        }),
      });

      console.log("Response type:", response.type);

      if (response.type === "opaque") {
        setStudentData((prev) => [
          ...prev,
          {
            nisn: studentForm.nisn,
            name: studentForm.name,
            class: studentForm.class,
          },
        ]);
        setStudentForm({
          nisn: "",
          name: "",
          class: "",
          error: "",
          loading: false,
        });
        setShowAddModal(false);
        alert("Data siswa berhasil ditambahkan!");
      } else {
        throw new Error("Unexpected response type");
      }
    } catch (error: any) {
      console.error("Error adding student:", error);
      setStudentForm(
        (prev: StudentFormState): StudentFormState => ({
          ...prev,
          error: `Gagal menambahkan siswa: ${error.message}`,
          loading: false,
        })
      );
    }
  };

  const handleEditStudent = async () => {
    if (
      !editStudent ||
      !studentForm.nisn ||
      !studentForm.name ||
      !studentForm.class
    ) {
      setStudentForm(
        (prev: StudentFormState): StudentFormState => ({
          ...prev,
          error: "Harap lengkapi semua field",
        })
      );
      return;
    }

    setStudentForm(
      (prev: StudentFormState): StudentFormState => ({
        ...prev,
        loading: true,
        error: "",
      })
    );

    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "editStudent",
          originalNisn: editStudent.nisn,
          nisn: studentForm.nisn,
          name: studentForm.name,
          class: studentForm.class,
        }),
      });

      console.log("Response type:", response.type);

      if (response.type === "opaque") {
        setStudentData((prev) =>
          prev.map((s) =>
            s.nisn === editStudent.nisn
              ? {
                  nisn: studentForm.nisn,
                  name: studentForm.name,
                  class: studentForm.class,
                }
              : s
          )
        );
        setStudentForm({
          nisn: "",
          name: "",
          class: "",
          error: "",
          loading: false,
        });
        setShowEditModal(false);
        setEditStudent(null);
        alert("Data siswa berhasil diperbarui!");
      } else {
        throw new Error("Unexpected response type");
      }
    } catch (error: any) {
      console.error("Error editing student:", error);
      setStudentForm(
        (prev: StudentFormState): StudentFormState => ({
          ...prev,
          error: `Gagal memperbarui siswa: ${error.message}`,
          loading: false,
        })
      );
    }
  };

  const handleDeleteStudent = async () => {
    if (!deleteStudentNisn) return;

    setStudentForm(
      (prev: StudentFormState): StudentFormState => ({
        ...prev,
        loading: true,
        error: "",
      })
    );

    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "deleteStudent",
          nisn: deleteStudentNisn,
        }),
      });

      console.log("Response type:", response.type);

      if (response.type === "opaque") {
        setStudentData((prev) =>
          prev.filter((s) => s.nisn !== deleteStudentNisn)
        );
        setShowDeleteModal(false);
        setDeleteStudentNisn(null);
        alert("Data siswa berhasil dihapus!");
      } else {
        throw new Error("Unexpected response type");
      }
    } catch (error: any) {
      console.error("Error deleting student:", error);
      setStudentForm(
        (prev: StudentFormState): StudentFormState => ({
          ...prev,
          error: `Gagal menghapus siswa: ${error.message}`,
          loading: false,
        })
      );
    }
  };

  const handleDeleteAllStudents = async () => {
    setStudentForm(
      (prev: StudentFormState): StudentFormState => ({
        ...prev,
        loading: true,
        error: "",
      })
    );

    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "deleteAllStudents",
        }),
      });

      console.log("Response type:", response.type);

      if (response.type === "opaque") {
        setStudentData([]); // Kosongkan data siswa lokal
        setShowDeleteAllModal(false);
        alert("Semua data siswa berhasil dihapus!");
      } else {
        throw new Error("Unexpected response type");
      }
    } catch (error: any) {
      console.error("Error deleting all students:", error);
      setStudentForm(
        (prev: StudentFormState): StudentFormState => ({
          ...prev,
          error: `Gagal menghapus semua data siswa: ${error.message}`,
          loading: false,
        })
      );
    } finally {
      setStudentForm(
        (prev: StudentFormState): StudentFormState => ({
          ...prev,
          loading: false,
        })
      );
    }
  };

  const handleAddTeacher = async () => {
    if (!teacherFormState.nip || !teacherFormState.name) {
      setTeacherFormState((prev: TeacherManagementFormState) => ({
        ...prev,
        error: "Harap lengkapi semua field",
      }));
      return;
    }

    if (teacherData.some((t) => t.nip === teacherFormState.nip)) {
      setTeacherFormState((prev: TeacherManagementFormState) => ({
        ...prev,
        error: "NIP sudah ada",
      }));
      return;
    }

    setTeacherFormState((prev: TeacherManagementFormState) => ({
      ...prev,
      loading: true,
      error: "",
    }));

    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "addTeacher",
          nip: teacherFormState.nip,
          name: teacherFormState.name,
        }),
      });

      if (response.type === "opaque") {
        setTeacherData((prev) => [
          ...prev,
          {
            nip: teacherFormState.nip,
            name: teacherFormState.name,
          },
        ]);
        setTeacherFormState({
          nip: "",
          name: "",
          error: "",
          loading: false,
        });
        setShowAddTeacherModal(false);
        alert("Data guru berhasil ditambahkan!");
      } else {
        throw new Error("Unexpected response type");
      }
    } catch (error: any) {
      console.error("Error adding teacher:", error);
      setTeacherFormState((prev: TeacherManagementFormState) => ({
        ...prev,
        error: `Gagal menambahkan guru: ${error.message}`,
        loading: false,
      }));
    }
  };

  const handleEditTeacher = async () => {
    if (!editTeacher || !teacherFormState.nip || !teacherFormState.name) {
      setTeacherFormState((prev: TeacherManagementFormState) => ({
        ...prev,
        error: "Harap lengkapi semua field",
      }));
      return;
    }

    setTeacherFormState((prev: TeacherManagementFormState) => ({
      ...prev,
      loading: true,
      error: "",
    }));

    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "editTeacher",
          originalNip: editTeacher.nip,
          nip: teacherFormState.nip,
          name: teacherFormState.name,
        }),
      });

      if (response.type === "opaque") {
        setTeacherData((prev) =>
          prev.map((t) =>
            t.nip === editTeacher.nip
              ? {
                  nip: teacherFormState.nip,
                  name: teacherFormState.name,
                }
              : t
          )
        );
        setTeacherFormState({
          nip: "",
          name: "",
          error: "",
          loading: false,
        });
        setShowEditTeacherModal(false);
        setEditTeacher(null);
        alert("Data guru berhasil diperbarui!");
      } else {
        throw new Error("Unexpected response type");
      }
    } catch (error: any) {
      console.error("Error editing teacher:", error);
      setTeacherFormState((prev: TeacherManagementFormState) => ({
        ...prev,
        error: `Gagal memperbarui guru: ${error.message}`,
        loading: false,
      }));
    }
  };

  const handleDeleteTeacher = async () => {
    if (!deleteTeacherNip) return;

    setTeacherFormState((prev: TeacherManagementFormState) => ({
      ...prev,
      loading: true,
      error: "",
    }));

    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "deleteTeacher",
          nip: deleteTeacherNip,
        }),
      });

      if (response.type === "opaque") {
        setTeacherData((prev) =>
          prev.filter((t) => t.nip !== deleteTeacherNip)
        );
        setShowDeleteTeacherModal(false);
        setDeleteTeacherNip(null);
        alert("Data guru berhasil dihapus!");
      } else {
        throw new Error("Unexpected response type");
      }
    } catch (error: any) {
      console.error("Error deleting teacher:", error);
      setTeacherFormState((prev: TeacherManagementFormState) => ({
        ...prev,
        error: `Gagal menghapus guru: ${error.message}`,
        loading: false,
      }));
    }
  };

  const handlePageChange = (
    page: "form" | "data" | "students" | "teacherForm" | "teacherData"
  ) => {
    setCurrentPage(page);
    if (page === "data") {
      fetchAttendanceData();
    }
  };

  const handleClearAttendance = async () => {
    setLoading(true);
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "clearStudentAttendance",
        }),
      });

      console.log("Response type:", response.type);

      if (response.type === "opaque") {
        setAttendanceData([]); // Kosongkan data absensi lokal
        alert(
          "Semua data absensi siswa di halaman ini dan sheet 'AbsenSiswa' telah dihapus."
        );
      } else {
        throw new Error("Unexpected response type");
      }
    } catch (error: any) {
      console.error("Error clearing student attendance:", error);
      alert(`Gagal menghapus data absensi siswa: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderLoginPage = () => (
    <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md mx-auto">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Login</h2>
      <div className="space-y-4">
        <select
          name="role"
          value={loginForm.role}
          onChange={handleLoginInputChange}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Pilih Peran</option>
          <option value="Guru">Guru</option>
          <option value="Siswa">Siswa</option>
          <option value="Kepala Sekolah">Kepala Sekolah</option>{" "}
          {/* Tambahkan ini */}
        </select>

        <select
          name="name"
          value={loginForm.name}
          onChange={handleLoginInputChange}
          disabled={!loginForm.role}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <option value="">Pilih Nama</option>
          {loginForm.role === "Guru"
            ? teacherData.map((item) => (
                <option key={item.nip} value={item.name}>
                  {item.name}
                </option>
              ))
            : loginForm.role === "Siswa"
            ? studentData.map((item) => (
                <option key={item.nisn} value={item.name}>
                  {item.name}
                </option>
              ))
            : loginForm.role === "Kepala Sekolah" // Tambahkan ini
            ? kepsekData.map((item) => (
                <option key={item.nomorinduk} value={item.name}>
                  {item.name}
                </option>
              ))
            : null}
        </select>

        <input
          type="text"
          name="idNumber"
          value={loginForm.idNumber}
          onChange={handleLoginInputChange}
          placeholder={
            loginForm.role === "Guru"
              ? "NIP"
              : loginForm.role === "Siswa"
              ? "NISN"
              : loginForm.role === "Kepala Sekolah"
              ? "Nomor Induk"
              : "Nomor Induk"
          }
          disabled={!loginForm.role}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />

        {loginForm.error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg">
            {loginForm.error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loginForm.loading || !loginForm.role}
          className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
        >
          {loginForm.loading ? "⏳ Memproses..." : "Login"}
        </button>
      </div>
    </div>
  );

  const renderFormPage = () => (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="date"
              value={form.date}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
            />
            <input
              type="text"
              name="time"
              value={form.time}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
            />
          </div>

          <input
            type="text"
            name="class"
            value={form.class}
            readOnly
            className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
          />

          <input
            type="text"
            name="name"
            value={form.name}
            readOnly
            className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
          />

          <input
            type="text"
            name="nisn"
            value={form.nisn}
            readOnly
            className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
          />

          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />

            {!form.photo && (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={openCameraApp}
                  disabled={form.loading}
                  className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center justify-center disabled:opacity-50"
                >
                  {form.loading ? "⏳ Memproses..." : "📸 Buka Kamera HP"}
                </button>
                <div className="text-xs text-gray-500 text-center">
                  Akan membuka aplikasi kamera HP Anda
                </div>
              </div>
            )}

            {form.photo && (
              <div className="space-y-2">
                <img
                  src={form.photo}
                  alt="Preview foto"
                  className="w-full h-64 object-cover rounded-lg border-2 border-green-300"
                />
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={retakePhoto}
                    className="flex-1 bg-yellow-600 text-white p-2 rounded-lg hover:bg-yellow-700 transition duration-200"
                  >
                    📸 Ambil Ulang
                  </button>
                  <button
                    type="button"
                    onClick={openCameraApp}
                    className="flex-1 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition duration-200"
                  >
                    📷 Foto Lain
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {form.error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg whitespace-pre-line">
            {form.error}
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!form.photoBase64 || form.loading}
          className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {form.loading ? "⏳ Menyimpan..." : "✅ Tambah Absen"}
        </button>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="text-xs uppercase bg-gray-200">
            <tr>
              <th className="px-4 py-2">Tanggal</th>
              <th className="px-4 py-2">Jam</th>
              <th className="px-4 py-2">Kelas</th>
              <th className="px-4 py-2">Nama</th>
              <th className="px-4 py-2">NISN</th>
              <th className="px-4 py-2">Foto</th>
            </tr>
          </thead>
          <tbody>
            {attendances.map((attendance) => (
              <tr key={attendance.id} className="border-b">
                <td className="px-4 py-2">{attendance.date}</td>
                <td className="px-4 py-2">{attendance.time}</td>
                <td className="px-4 py-2">{attendance.class}</td>
                <td className="px-4 py-2">{attendance.name}</td>
                <td className="px-4 py-2">{attendance.nisn}</td>
                <td className="px-4 py-2">
                  {attendance.photo ? (
                    <img
                      src={attendance.photo}
                      alt="Foto siswa"
                      className="w-12 h-12 object-cover rounded-full border-2 border-gray-300"
                    />
                  ) : (
                    <span className="text-gray-500">Tidak ada foto</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTeacherFormPage = () => (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="date"
              value={teacherForm.date}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
            />
            <input
              type="text"
              name="time"
              value={teacherForm.time}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
            />
          </div>

          <select
            name="class"
            value={teacherForm.class}
            onChange={handleTeacherInputChange}
            required
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Pilih Kelas</option>
            {studentData
              .map((s) => s.class)
              .filter((cls, index, arr) => arr.indexOf(cls) === index)
              .map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
          </select>

          <select
            name="name"
            value={teacherForm.name}
            onChange={handleTeacherInputChange}
            required
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Pilih Nama</option>
            {studentData
              .filter((s) => s.class === teacherForm.class)
              .map((s) => (
                <option key={s.nisn} value={s.name}>
                  {s.name}
                </option>
              ))}
          </select>

          <input
            type="text"
            name="nisn"
            value={teacherForm.nisn}
            readOnly
            placeholder="NISN akan terisi otomatis"
            required
            className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
          />

          <select
            name="status"
            value={teacherForm.status}
            onChange={handleTeacherInputChange}
            required
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Hadir">Hadir</option>
            <option value="Alpha">Alpha</option>
            <option value="Izin">Izin</option>
            <option value="Sakit">Sakit</option>
          </select>
        </div>

        {teacherForm.error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg whitespace-pre-line">
            {teacherForm.error}
          </div>
        )}

        <button
          type="button"
          onClick={handleTeacherSubmit}
          disabled={teacherForm.loading}
          className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {teacherForm.loading ? "⏳ Menyimpan..." : "✅ Tambah Absen"}
        </button>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="text-xs uppercase bg-gray-200">
            <tr>
              <th className="px-4 py-2">Tanggal</th>
              <th className="px-4 py-2">Jam</th>
              <th className="px-4 py-2">Kelas</th>
              <th className="px-4 py-2">Nama</th>
              <th className="px-4 py-2">NISN</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {attendances.map((attendance) => (
              <tr key={attendance.id} className="border-b">
                <td className="px-4 py-2">{attendance.date}</td>
                <td className="px-4 py-2">{attendance.time}</td>
                <td className="px-4 py-2">{attendance.class}</td>
                <td className="px-4 py-2">{attendance.name}</td>
                <td className="px-4 py-2">{attendance.nisn}</td>
                <td className="px-4 py-2">{attendance.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderDataPage = () => {
    // Fungsi untuk mengkonversi Google Drive link ke direct download link
    const convertGoogleDriveUrl = (url: string): string => {
      if (url.includes("drive.google.com/file/d/")) {
        const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
          const fileId = match[1];
          return `https://lh3.googleusercontent.com/d/${fileId}=w1000?authuser=0`;
        }
      }
      return url; // Return original URL if not a Google Drive link
    };

    // Alternative converter for Google Drive
    const convertGoogleDriveUrlAlt = (url: string): string => {
      if (url.includes("drive.google.com/file/d/")) {
        const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
          const fileId = match[1];
          return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
        }
      }
      return url;
    };

    // Fungsi untuk download PDF
    const downloadPDF = async (): Promise<void> => {
      const button = document.getElementById(
        "downloadPdfButton"
      ) as HTMLButtonElement;
      if (!button) return;

      // Simpan teks dan status awal
      const originalButtonText = button.innerHTML;

      // Ubah teks saat memproses
      button.disabled = true;
      button.innerHTML = `
        <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Memproses gambar...
      `;

      try {
        // Debug: Check what's available in window
        console.log("window.jsPDF:", (window as any).jsPDF);
        console.log("window.jspdf:", (window as any).jspdf);
        console.log(
          "Available properties:",
          Object.keys(window).filter((key) => key.toLowerCase().includes("pdf"))
        );

        // Alternative ways to access jsPDF
        let jsPDF: any;

        if ((window as any).jsPDF) {
          jsPDF = (window as any).jsPDF;
          console.log("Using window.jsPDF");
        } else if ((window as any).jspdf && (window as any).jspdf.jsPDF) {
          jsPDF = (window as any).jspdf.jsPDF;
          console.log("Using window.jspdf.jsPDF");
        } else {
          // Try to load script dynamically
          console.log("Attempting to load jsPDF dynamically...");
          const script = document.createElement("script");
          script.src = "https://unpkg.com/jspdf@2.5.1/dist/jspdf.umd.min.js";
          script.onload = () => {
            console.log("jsPDF loaded dynamically");
            setTimeout(() => downloadPDF(), 100); // Retry after script loads
          };
          script.onerror = () => {
            alert("Gagal memuat library jsPDF. Periksa koneksi internet Anda.");
          };
          document.head.appendChild(script);
          return;
        }

        const doc = new jsPDF();

        // Filter data berdasarkan bulan dan tanggal yang dipilih
        const filteredData: Attendance[] = attendanceData.filter(
          (attendance: Attendance) => {
            let matchMonth = true;
            let matchDate = true;

            // Filter berdasarkan bulan
            if (selectedMonth) {
              const [day, month, year] = attendance.date.split("/");
              matchMonth = month === selectedMonth;
            }

            // Filter berdasarkan tanggal
            if (selectedDate) {
              // Konversi tanggal dari format DD/MM/YYYY ke YYYY-MM-DD untuk perbandingan
              const [day, month, year] = attendance.date.split("/");
              const attendanceDate = `${year}-${month.padStart(
                2,
                "0"
              )}-${day.padStart(2, "0")}`;
              matchDate = attendanceDate === selectedDate;
            }

            return matchMonth && matchDate;
          }
        );

        // PDF Header
        doc.setFontSize(16);
        doc.text("Laporan Data Absensi Siswa", 14, 15);

        let yPosition = 25;

        // Month filter information
        if (selectedMonth) {
          const monthNames = [
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
          const monthName = monthNames[parseInt(selectedMonth) - 1];
          doc.setFontSize(12);
          doc.text(`Bulan: ${monthName}`, 14, yPosition);
          yPosition += 10;
        }

        // Date filter information
        if (selectedDate) {
          const [year, month, day] = selectedDate.split("-");
          doc.setFontSize(12);
          doc.text(`Tanggal: ${day}/${month}/${year}`, 14, yPosition);
          yPosition += 10;
        }

        // Print date
        doc.setFontSize(10);
        doc.text(
          `Tanggal Cetak: ${new Date().toLocaleDateString("id-ID")}`,
          14,
          yPosition
        );
        yPosition += 10;

        // Helper function to load image from URL with multiple attempts
        const loadImageFromUrl = (url: string): Promise<string> => {
          return new Promise(async (resolve, reject) => {
            console.log("Original URL:", url);

            // Try multiple URL formats for Google Drive
            const urlsToTry: string[] = [];

            if (url.includes("drive.google.com/file/d/")) {
              const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
              if (match && match[1]) {
                const fileId = match[1];
                urlsToTry.push(
                  `https://lh3.googleusercontent.com/d/${fileId}=w1000?authuser=0`,
                  `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`,
                  `https://drive.google.com/uc?export=view&id=${fileId}`,
                  `https://drive.google.com/uc?id=${fileId}`,
                  url // original URL as last resort
                );
              }
            } else {
              urlsToTry.push(url);
            }

            console.log("URLs to try:", urlsToTry);

            // Try each URL until one works
            for (let i = 0; i < urlsToTry.length; i++) {
              const tryUrl = urlsToTry[i];
              console.log(`Trying URL ${i + 1}/${urlsToTry.length}:`, tryUrl);

              try {
                const result = await new Promise<string>((resolve, reject) => {
                  const img = new Image();
                  img.crossOrigin = "anonymous";

                  const timeout = setTimeout(() => {
                    reject(new Error("Image load timeout"));
                  }, 10000); // 10 second timeout

                  img.onload = () => {
                    clearTimeout(timeout);
                    try {
                      const canvas = document.createElement("canvas");
                      const ctx = canvas.getContext("2d");
                      if (!ctx) {
                        reject(new Error("Cannot get canvas context"));
                        return;
                      }

                      canvas.width = img.width;
                      canvas.height = img.height;
                      ctx.drawImage(img, 0, 0);
                      const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
                      resolve(dataUrl);
                    } catch (error) {
                      reject(error);
                    }
                  };

                  img.onerror = (error) => {
                    clearTimeout(timeout);
                    reject(new Error(`Failed to load image: ${error}`));
                  };

                  img.src = tryUrl;
                });

                console.log("Successfully loaded image from:", tryUrl);
                resolve(result);
                return; // Success, exit the loop
              } catch (error) {
                console.log(`Failed to load from ${tryUrl}:`, error);
                // Continue to next URL
              }
            }

            // If all URLs failed
            console.log("All URLs failed for:", url);
            reject(new Error("Failed to load image from all attempted URLs"));
          });
        };

        // Preprocess images - convert all images to base64 with timeout
        console.log("Starting image preprocessing...");
        const processImageWithTimeout = async (
          attendance: Attendance,
          timeout: number = 15000
        ): Promise<ProcessedAttendance> => {
          if (!attendance.photo) {
            return { ...attendance, processedPhoto: null };
          }

          return Promise.race([
            (async (): Promise<ProcessedAttendance> => {
              try {
                console.log(
                  `Processing image for ${attendance.name}:`,
                  attendance.photo
                );
                let processedPhoto: string | null = attendance.photo;

                if (
                  attendance.photo &&
                  attendance.photo.startsWith("https://")
                ) {
                  processedPhoto = await loadImageFromUrl(attendance.photo);
                  console.log(
                    "Successfully processed image for:",
                    attendance.name
                  );
                } else if (
                  attendance.photo &&
                  !attendance.photo.startsWith("data:image")
                ) {
                  processedPhoto = await loadImageFromUrl(attendance.photo);
                }

                return { ...attendance, processedPhoto };
              } catch (error) {
                console.log(
                  "Failed to process image for:",
                  attendance.name,
                  error
                );
                return { ...attendance, processedPhoto: null };
              }
            })(),
            new Promise<ProcessedAttendance>((_, reject) =>
              setTimeout(
                () => reject(new Error("Image processing timeout")),
                timeout
              )
            ),
          ]).catch((error): ProcessedAttendance => {
            console.log(
              "Image processing timed out or failed for:",
              attendance.name,
              error
            );
            return { ...attendance, processedPhoto: null };
          });
        };

        // Process images with limited concurrency
        const processedData: ProcessedAttendance[] = [];
        const batchSize = 3; // Process 3 images at a time

        for (let i = 0; i < filteredData.length; i += batchSize) {
          const batch = filteredData.slice(i, i + batchSize);
          console.log(
            `Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(
              filteredData.length / batchSize
            )}`
          );

          const batchResults = await Promise.all(
            batch.map((attendance: Attendance) =>
              processImageWithTimeout(attendance)
            )
          );

          processedData.push(...batchResults);

          // Small delay between batches
          if (i + batchSize < filteredData.length) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }

        console.log(
          "Image preprocessing completed. Results:",
          processedData.map((d) => ({
            name: d.name,
            hasPhoto: !!d.photo,
            processedSuccessfully: !!d.processedPhoto,
          }))
        );

        // Prepare table data with processed photos
        const tableData: (string | number)[][] = processedData.map(
          (attendance: ProcessedAttendance) => {
            let photoStatus = "Tidak ada foto";

            if (attendance.processedPhoto) {
              photoStatus = "Ada foto";
            }

            return [
              attendance.date,
              attendance.time,
              attendance.class,
              attendance.name,
              attendance.nisn,
              photoStatus,
              attendance.status,
            ];
          }
        );

        // Create table using autoTable with custom didDrawCell for photos
        doc.autoTable({
          head: [["Tanggal", "Jam", "Kelas", "Nama", "NISN", "Foto", "Status"]],
          body: tableData,
          startY: yPosition + 5,
          styles: {
            fontSize: 9,
            cellPadding: 3,
            minCellHeight: 20,
          },
          headStyles: {
            fillColor: [59, 130, 246],
            textColor: 255,
            fontStyle: "bold",
          },
          alternateRowStyles: {
            fillColor: [248, 250, 252],
          },
          columnStyles: {
            0: { cellWidth: 22 }, // Tanggal
            1: { cellWidth: 18 }, // Jam
            2: { cellWidth: 18 }, // Kelas
            3: { cellWidth: 35 }, // Nama
            4: { cellWidth: 25 }, // NISN
            5: { cellWidth: 30 }, // Foto
            6: { cellWidth: 20 }, // Status
          },
          didDrawCell: (data: any) => {
            // Add photo if available - HANYA untuk baris data, BUKAN header
            if (
              data.column.index === 5 &&
              data.row.index >= 0 &&
              data.section === "body"
            ) {
              // Photo column - hanya untuk body, bukan header
              const attendance = processedData[data.row.index];

              if (attendance && attendance.processedPhoto) {
                try {
                  // Clear the cell text first (remove "Ada foto" text)
                  doc.setFillColor(255, 255, 255); // White background
                  if (data.row.index % 2 !== 0) {
                    doc.setFillColor(248, 250, 252); // Alternate row color
                  }
                  doc.rect(
                    data.cell.x,
                    data.cell.y,
                    data.cell.width,
                    data.cell.height,
                    "F"
                  );

                  // Add only the image, no text
                  const imgWidth = 15;
                  const imgHeight = 15;
                  const x = data.cell.x + (data.cell.width - imgWidth) / 2; // Center horizontally
                  const y = data.cell.y + (data.cell.height - imgHeight) / 2; // Center vertically

                  doc.addImage(
                    attendance.processedPhoto,
                    "JPEG",
                    x,
                    y,
                    imgWidth,
                    imgHeight
                  );
                } catch (error) {
                  console.log("Error adding image to PDF:", error);
                  doc.setFontSize(8);
                  doc.text("Error foto", data.cell.x + 2, data.cell.y + 10);
                }
              } else {
                // Only show text when there's no photo
                doc.setFontSize(8);
                doc.setTextColor(128, 128, 128);
                doc.text("Tidak ada", data.cell.x + 2, data.cell.y + 10);
                doc.setTextColor(0, 0, 0); // Reset color
              }
            }
            // TIDAK menambahkan gambar untuk header (data.section === 'head')
          },
        });

        // Statistics below table
        const totalData = filteredData.length;
        const hadirCount = filteredData.filter(
          (a) => a.status === "Hadir"
        ).length;
        const alphaCount = filteredData.filter(
          (a) => a.status === "Alpha"
        ).length;
        const izinCount = filteredData.filter(
          (a) => a.status === "Izin"
        ).length;
        const sakitCount = filteredData.filter(
          (a) => a.status === "Sakit"
        ).length;

        const finalY = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(12);
        doc.text("Ringkasan:", 14, finalY);
        doc.setFontSize(10);
        doc.text(`Total Data: ${totalData}`, 14, finalY + 10);
        doc.text(`Hadir: ${hadirCount}`, 14, finalY + 20);
        doc.text(`Alpha: ${alphaCount}`, 60, finalY + 20);
        doc.text(`Izin: ${izinCount}`, 100, finalY + 20);
        doc.text(`Sakit: ${sakitCount}`, 140, finalY + 20);

        // Generate filename
        const monthNames = [
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

        let fileName = `Absensi_${new Date().getFullYear()}.pdf`;

        if (selectedDate) {
          const [year, month, day] = selectedDate.split("-");
          fileName = `Absensi_${day}-${month}-${year}.pdf`;
        } else if (selectedMonth) {
          const monthName = monthNames[parseInt(selectedMonth) - 1];
          fileName = `Absensi_${monthName}_${new Date().getFullYear()}.pdf`;
        }

        // Download PDF
        doc.save(fileName);
      } catch (error) {
        console.error("Error generating PDF:", error);
        alert("Terjadi kesalahan saat membuat PDF. Silakan coba lagi.");
      } finally {
        // Kembalikan teks dan status tombol ke kondisi awal
        button.disabled = false;
        button.innerHTML = originalButtonText;
      }
    };

    return (
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Data Absensi
            </h2>
            {/* Tambahkan tombol Hapus di sini */}
            <button
              onClick={() => setShowClearAttendanceModal(true)} // Ubah ini: jangan langsung panggil handleClearAttendance, tapi buka modal
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Hapus Semua Data Absensi Siswa
            </button>
            {/* Tombol Download PDF tetap ada */}
            <button
              id="downloadPdfButton"
              onClick={downloadPDF}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
              disabled={loading || attendanceData.length === 0}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Download PDF
            </button>
          </div>

          {/* Filter Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter per Bulan
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Semua Bulan</option>
                {[
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
                ].map((month, index) => {
                  const monthValue = String(index + 1).padStart(2, "0");
                  return (
                    <option key={monthValue} value={monthValue}>
                      {month}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter per Tanggal
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {(selectedMonth || selectedDate) && (
            <div className="mt-3">
              <button
                onClick={() => {
                  setSelectedMonth("");
                  setSelectedDate("");
                }}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Hapus Semua Filter
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Memuat data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="text-xs uppercase bg-gray-200">
                <tr>
                  <th className="px-4 py-2">Tanggal</th>
                  <th className="px-4 py-2">Jam</th>
                  <th className="px-4 py-2">Kelas</th>
                  <th className="px-4 py-2">Nama</th>
                  <th className="px-4 py-2">NISN</th>
                  <th className="px-4 py-2">Foto</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      Tidak ada data absensi
                    </td>
                  </tr>
                ) : (
                  attendanceData
                    .filter((attendance: Attendance) => {
                      let matchMonth = true;
                      let matchDate = true;

                      if (selectedMonth) {
                        const [day, month, year] = attendance.date.split("/");
                        matchMonth = month === selectedMonth;
                      }

                      if (selectedDate) {
                        const [day, month, year] = attendance.date.split("/");
                        const attendanceDate = `${year}-${month.padStart(
                          2,
                          "0"
                        )}-${day.padStart(2, "0")}`;
                        matchDate = attendanceDate === selectedDate;
                      }

                      return matchMonth && matchDate;
                    })
                    .map((attendance: Attendance, index: number) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2">{attendance.date}</td>
                        <td className="px-4 py-2">{attendance.time}</td>
                        <td className="px-4 py-2">{attendance.class}</td>
                        <td className="px-4 py-2">{attendance.name}</td>
                        <td className="px-4 py-2">{attendance.nisn}</td>
                        <td className="px-4 py-2">
                          {attendance.photo ? (
                            attendance.photo.startsWith("https://") ? (
                              attendance.photo.includes("drive.google.com") ? (
                                <div className="flex flex-col items-center">
                                  <img
                                    src={convertGoogleDriveUrl(
                                      attendance.photo
                                    )}
                                    alt="Foto siswa"
                                    className="w-12 h-12 object-cover rounded-full border-2 border-gray-300 mb-1"
                                    onError={(e) => {
                                      const target =
                                        e.target as HTMLImageElement;
                                      if (attendance.photo) {
                                        target.src = convertGoogleDriveUrlAlt(
                                          attendance.photo
                                        );
                                        target.onerror = () => {
                                          target.style.display = "none";
                                          const parent = target.parentElement;
                                          if (parent) {
                                            const span =
                                              document.createElement("span");
                                            span.className =
                                              "text-xs text-gray-500";
                                            span.textContent = "Preview gagal";
                                            parent.appendChild(span);
                                          }
                                        };
                                      }
                                    }}
                                  />
                                  <a
                                    href={attendance.photo}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 underline text-xs"
                                  >
                                    Buka Foto
                                  </a>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center">
                                  <img
                                    src={attendance.photo}
                                    alt="Foto siswa"
                                    className="w-12 h-12 object-cover rounded-full border-2 border-gray-300 mb-1"
                                  />
                                  <a
                                    href={attendance.photo}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 underline text-xs"
                                  >
                                    Link
                                  </a>
                                </div>
                              )
                            ) : (
                              <img
                                src={attendance.photo}
                                alt="Foto siswa"
                                className="w-12 h-12 object-cover rounded-full border-2 border-gray-300"
                              />
                            )
                          ) : (
                            <span className="text-gray-500">
                              Tidak ada foto
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              attendance.status === "Hadir"
                                ? "bg-green-100 text-green-800"
                                : attendance.status === "Alpha"
                                ? "bg-red-100 text-red-800"
                                : attendance.status === "Izin"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {attendance.status}
                          </span>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal Konfirmasi Hapus Semua Absensi */}
        {showClearAttendanceModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">
                Konfirmasi Hapus Semua Data Absensi
              </h2>
              <p className="mb-4">
                Apakah Anda yakin ingin menghapus semua data absensi siswa?
                Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={async () => {
                    await handleClearAttendance(); // Jalankan penghapusan jika klik Ya
                    setShowClearAttendanceModal(false); // Tutup modal setelah selesai
                  }}
                  disabled={loading} // Gunakan state loading existing untuk disable tombol saat proses
                  className="flex-1 bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition duration-200 disabled:opacity-50"
                >
                  {loading ? "⏳ Menghapus..." : "Ya, Hapus"}
                </button>
                <button
                  onClick={() => setShowClearAttendanceModal(false)} // Tutup modal jika klik Tidak
                  className="flex-1 bg-gray-300 text-gray-700 p-2 rounded-lg hover:bg-gray-400 transition duration-200"
                >
                  Tidak
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderStudentsPage = () => (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Data Siswa</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setStudentForm({
                nisn: "",
                name: "",
                class: "",
                error: "",
                loading: false,
              });
              setShowAddModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Tambah Siswa
          </button>
          {studentData.length > 0 && ( // Tambahkan kondisi ini agar tombol hanya muncul jika ada data
            <button
              onClick={() => setShowDeleteAllModal(true)} // Perbaiki: hapus } ekstra
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200"
            >
              Hapus Semua Siswa
            </button>
          )}
        </div>
      </div>

      {studentForm.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
          {studentForm.error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="text-xs uppercase bg-gray-200">
            <tr>
              <th className="px-4 py-2">NISN</th>
              <th className="px-4 py-2">Nama</th>
              <th className="px-4 py-2">Kelas</th>
              <th className="px-4 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {studentData.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  Tidak ada data siswa
                </td>
              </tr>
            ) : (
              studentData.map((student, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{student.nisn}</td>
                  <td className="px-4 py-2">{student.name}</td>
                  <td className="px-4 py-2">{student.class}</td>
                  <td className="px-4 py-2 flex space-x-2">
                    <button
                      onClick={() => {
                        setEditStudent(student);
                        setStudentForm({
                          nisn: student.nisn,
                          name: student.name,
                          class: student.class,
                          error: "",
                          loading: false,
                        });
                        setShowEditModal(true);
                      }}
                      className="bg-yellow-600 text-white px-3 py-1 rounded-lg hover:bg-yellow-700 transition duration-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setDeleteStudentNisn(student.nisn);
                        setShowDeleteModal(true);
                      }}
                      className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition duration-200"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Tambah Siswa</h2>
            <div className="space-y-4">
              <input
                type="text"
                name="nisn"
                value={studentForm.nisn}
                onChange={handleStudentInputChange}
                placeholder="NISN"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="name"
                value={studentForm.name}
                onChange={handleStudentInputChange}
                placeholder="Nama"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="class"
                value={studentForm.class}
                onChange={handleStudentInputChange}
                placeholder="Kelas"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {studentForm.error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg">
                  {studentForm.error}
                </div>
              )}
              <div className="flex space-x-2">
                <button
                  onClick={handleAddStudent}
                  disabled={studentForm.loading}
                  className="flex-1 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
                >
                  {studentForm.loading ? "⏳ Menyimpan..." : "Simpan"}
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 p-2 rounded-lg hover:bg-gray-400 transition duration-200"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit Siswa</h2>
            <div className="space-y-4">
              <input
                type="text"
                name="nisn"
                value={studentForm.nisn}
                onChange={handleStudentInputChange}
                placeholder="NISN"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="name"
                value={studentForm.name}
                onChange={handleStudentInputChange}
                placeholder="Nama"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="class"
                value={studentForm.class}
                onChange={handleStudentInputChange}
                placeholder="Kelas"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {studentForm.error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg">
                  {studentForm.error}
                </div>
              )}
              <div className="flex space-x-2">
                <button
                  onClick={handleEditStudent}
                  disabled={studentForm.loading}
                  className="flex-1 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
                >
                  {studentForm.loading ? "⏳ Memperbarui..." : "Perbarui"}
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditStudent(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 p-2 rounded-lg hover:bg-gray-400 transition duration-200"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Konfirmasi Hapus</h2>
            <p className="mb-4">
              Apakah Anda yakin ingin menghapus data siswa ini?
            </p>
            {studentForm.error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg mb-4">
                {studentForm.error}
              </div>
            )}
            <div className="flex space-x-2">
              <button
                onClick={handleDeleteStudent}
                disabled={studentForm.loading}
                className="flex-1 bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition duration-200 disabled:opacity-50"
              >
                {studentForm.loading ? "⏳ Menghapus..." : "Hapus"}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 p-2 rounded-lg hover:bg-gray-400 transition duration-200"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Confirmation Modal - Pindahkan ke sini */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              Konfirmasi Hapus Semua
            </h2>
            <p className="mb-4">
              Apakah Anda yakin ingin menghapus SEMUA data siswa? Tindakan ini
              tidak dapat dibatalkan.
            </p>
            {studentForm.error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg mb-4">
                {studentForm.error}
              </div>
            )}
            <div className="flex space-x-2">
              <button
                onClick={handleDeleteAllStudents}
                disabled={studentForm.loading}
                className="flex-1 bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition duration-200 disabled:opacity-50"
              >
                {studentForm.loading ? "⏳ Menghapus..." : "Hapus Semua"}
              </button>
              <button
                onClick={() => setShowDeleteAllModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 p-2 rounded-lg hover:bg-gray-400 transition duration-200"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderTeacherDataPage = () => (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Data Guru</h2>
        <button
          onClick={() => {
            setTeacherFormState({
              nip: "",
              name: "",
              error: "",
              loading: false,
            });
            setShowAddTeacherModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
        >
          Tambah Guru
        </button>
      </div>

      {teacherFormState.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
          {teacherFormState.error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="text-xs uppercase bg-gray-200">
            <tr>
              <th className="px-4 py-2">NIP</th>
              <th className="px-4 py-2">Nama</th>
              <th className="px-4 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {teacherData.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                  Tidak ada data guru
                </td>
              </tr>
            ) : (
              teacherData.map((teacher, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{teacher.nip}</td>
                  <td className="px-4 py-2">{teacher.name}</td>
                  <td className="px-4 py-2 flex space-x-2">
                    <button
                      onClick={() => {
                        setEditTeacher(teacher);
                        setTeacherFormState({
                          nip: teacher.nip,
                          name: teacher.name,
                          error: "",
                          loading: false,
                        });
                        setShowEditTeacherModal(true);
                      }}
                      className="bg-yellow-600 text-white px-3 py-1 rounded-lg hover:bg-yellow-700 transition duration-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setDeleteTeacherNip(teacher.nip);
                        setShowDeleteTeacherModal(true);
                      }}
                      className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition duration-200"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Teacher Modal */}
      {showAddTeacherModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Tambah Guru</h2>
            <div className="space-y-4">
              <input
                type="text"
                name="nip"
                value={teacherFormState.nip}
                onChange={handleTeacherFormInputChange}
                placeholder="NIP"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="name"
                value={teacherFormState.name}
                onChange={handleTeacherFormInputChange}
                placeholder="Nama"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {teacherFormState.error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg">
                  {teacherFormState.error}
                </div>
              )}
              <div className="flex space-x-2">
                <button
                  onClick={handleAddTeacher}
                  disabled={teacherFormState.loading}
                  className="flex-1 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
                >
                  {teacherFormState.loading ? "⏳ Menyimpan..." : "Simpan"}
                </button>
                <button
                  onClick={() => setShowAddTeacherModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 p-2 rounded-lg hover:bg-gray-400 transition duration-200"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Teacher Modal */}
      {showEditTeacherModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit Guru</h2>
            <div className="space-y-4">
              <input
                type="text"
                name="nip"
                value={teacherFormState.nip}
                onChange={handleTeacherFormInputChange}
                placeholder="NIP"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="name"
                value={teacherFormState.name}
                onChange={handleTeacherFormInputChange}
                placeholder="Nama"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {teacherFormState.error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg">
                  {teacherFormState.error}
                </div>
              )}
              <div className="flex space-x-2">
                <button
                  onClick={handleEditTeacher}
                  disabled={teacherFormState.loading}
                  className="flex-1 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
                >
                  {teacherFormState.loading ? "⏳ Memperbarui..." : "Perbarui"}
                </button>
                <button
                  onClick={() => {
                    setShowEditTeacherModal(false);
                    setEditTeacher(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 p-2 rounded-lg hover:bg-gray-400 transition duration-200"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Teacher Confirmation Modal */}
      {showDeleteTeacherModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Konfirmasi Hapus</h2>
            <p className="mb-4">
              Apakah Anda yakin ingin menghapus data guru ini?
            </p>
            {teacherFormState.error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg mb-4">
                {teacherFormState.error}
              </div>
            )}
            <div className="flex space-x-2">
              <button
                onClick={handleDeleteTeacher}
                disabled={teacherFormState.loading}
                className="flex-1 bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition duration-200 disabled:opacity-50"
              >
                {teacherFormState.loading ? "⏳ Menghapus..." : "Hapus"}
              </button>
              <button
                onClick={() => setShowDeleteTeacherModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 p-2 rounded-lg hover:bg-gray-400 transition duration-200"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-4xl sm:mx-auto w-full max-w-4xl mx-auto px-4">
        <h1 className="text-center text-2xl font-semibold text-gray-900 mb-6">
          Aplikasi Absensi Siswa
        </h1>

        {!isLoggedIn ? (
          renderLoginPage()
        ) : (
          <>
            <div className="flex justify-center mb-6">
              <div className="bg-white rounded-lg shadow-lg p-1 flex">
                {userRole === "Siswa" && (
                  <button
                    onClick={() => handlePageChange("form")}
                    className={`px-6 py-2 rounded-md transition duration-200 ${
                      currentPage === "form"
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    📝 Form Absensi
                  </button>
                )}
                {userRole === "Guru" && (
                  <>
                    <button
                      onClick={() => handlePageChange("teacherForm")}
                      className={`px-6 py-2 rounded-md transition duration-200 ${
                        currentPage === "teacherForm"
                          ? "bg-blue-600 text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      📝 Form Absensi
                    </button>
                    <button
                      onClick={() => handlePageChange("data")}
                      className={`px-6 py-2 rounded-md transition duration-200 ${
                        currentPage === "data"
                          ? "bg-blue-600 text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      📊 Data Absensi
                    </button>
                    <button
                      onClick={() => handlePageChange("students")}
                      className={`px-6 py-2 rounded-md transition duration-200 ${
                        currentPage === "students"
                          ? "bg-blue-600 text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      👥 Data Siswa
                    </button>
                  </>
                )}
                {userRole === "Kepala Sekolah" && ( // Tambahkan ini
                  <button
                    onClick={() => handlePageChange("teacherData")}
                    className={`px-6 py-2 rounded-md transition duration-200 ${
                      currentPage === "teacherData"
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    👨‍🏫 Data Guru
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="px-6 py-2 rounded-md transition duration-200 text-red-600 hover:bg-red-100"
                >
                  🚪 Logout
                </button>
              </div>
            </div>

            {currentPage === "form" && userRole === "Siswa"
              ? renderFormPage()
              : currentPage === "teacherForm" && userRole === "Guru"
              ? renderTeacherFormPage()
              : currentPage === "data" && userRole === "Guru"
              ? renderDataPage()
              : currentPage === "students" && userRole === "Guru"
              ? renderStudentsPage()
              : currentPage === "teacherData" && userRole === "Kepala Sekolah" // Tambahkan ini
              ? renderTeacherDataPage()
              : null}
          </>
        )}
      </div>
    </div>
  );
};

export default App;
