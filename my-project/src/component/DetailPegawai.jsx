import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MasaJabatan from './masaJabatan';
import { useNavigate } from 'react-router-dom';

const DetailPegawai = () => {
    const [pegawai, setPegawai] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log("Fetching data from API...");
                const response = await axios.get('https://back-fix-laps.vercel.app/api/get-data');
                console.log("Response received:", response);

                if (response.status !== 200) throw new Error('Gagal mengambil data');

                const result = response.data;
                console.log("Data from API:", result);

                if (result.data && Array.isArray(result.data)) {
                    const pegawaiData = result.data.map((item) => ({
                        id: item[0],
                        name: item[1],
                        date: item[3],
                    }));
                    console.log("Processed pegawai data:", pegawaiData);
                    setPegawai(pegawaiData);
                } else {
                    throw new Error('Format data tidak sesuai atau tidak ada');
                }
            } catch (err) {
                console.error("Error fetching data:", err.message);
            }
        };

        fetchData();
    }, []);

    // Fungsi untuk menghapus pegawai
    const handleDeletePegawai = async (id) => {
        console.log("Attempting to delete pegawai with ID:", id);
        
        const confirmed = window.confirm("Apakah Anda yakin ingin menghapus pegawai ini?");
        if (confirmed) {
            try {
                console.log("Fetching data to ensure it's up to date before deletion...");
                const response = await axios.get('https://back-fix-laps.vercel.app/api/get-data');
                if (response.status !== 200) throw new Error('Gagal mengambil data');
                const result = response.data;

                console.log("Data fetched for deletion check:", result);

                if (result.data && Array.isArray(result.data)) {
                    const deletePegawai = result.data.map((item) => ({
                        id: item[0],
                    }));
                    console.log("Delete pegawai data:", deletePegawai);
                }

                // Menghapus pegawai dari API
                const deleteResponse = await axios.delete(`https://back-fix-laps.vercel.app/api/delete-data?id=${id}`);
                console.log('Data berhasil dihapus:', deleteResponse.data);

                // Menghapus pegawai dari state
                setPegawai((prevPegawai) => {
                    const updatedPegawai = prevPegawai.filter((item) => item.id !== id);
                    console.log("Updated pegawai state after deletion:", updatedPegawai);
                    return updatedPegawai;
                });
            } catch (err) {
                console.error("Error menghapus pegawai:", err);
            }
        } else {
            console.log("Deletion canceled by user.");
        }
    };

    const filteredPegawai = pegawai.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mt-4">
            <h5 className="text-center">Detail Data Pegawai</h5>

            {/* Input Pencarian */}
            <div className="mb-4">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Cari pegawai..."
                    value={searchTerm}
                    onChange={(e) => {
                        console.log("Search term changed:", e.target.value);
                        setSearchTerm(e.target.value);
                    }}
                />
            </div>

            {/* Card Data Pegawai */}
            <div className="row d-flex justify-content-center align-items-center pt-3">
                {filteredPegawai.map((item) => (
                    <div className="col-6 col-md-3 mb-3" key={item.id}>
                        <div className="card h-100 d-flex flex-column border p-2">
                            {/* Gambar menggunakan iframe untuk pratinjau Google Drive */}
                            <iframe
                                src={`https://drive.google.com/file/d/${item.id}/preview`}
                                className="card-img-top img-fluid"
                                style={{ width: '100%', height: '200px', border: 'none' }}
                                title={item.name}
                                allow="autoplay"
                            ></iframe>
                            <div className="card-body d-flex flex-column justify-content-between">
                                <h5 className="card-title">{item.name}</h5>
                                <p className="card-text">{item.date}</p>
                                <p className="card-text">
                                    <MasaJabatan masaAkhir={item.date} />
                                </p>
                                {/* Tombol Hapus */}
                                <button 
                                    className="btn btn-danger"
                                    onClick={() => handleDeletePegawai(item.id)}
                                >
                                    Hapus
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
};

export default DetailPegawai;
