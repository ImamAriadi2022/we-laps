import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MasaJabatan = ({ masaAkhir }) => {
    const [currentTime, setCurrentTime] = useState(null);
    const [sisaMasa, setSisaMasa] = useState('');

    useEffect(() => {
        const fetchCurrentTime = async () => {
            try {
                const response = await axios.get('https://timeapi.io/api/Time/current/zone?timeZone=Asia/Jakarta');
                setCurrentTime(new Date(response.data.dateTime));
            } catch (error) {
                console.error("Error fetching current time:", error);
            }
        };

        fetchCurrentTime();

        const interval = setInterval(() => {
            fetchCurrentTime();
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (currentTime && masaAkhir) {
            const endTime = new Date(masaAkhir.split("/").reverse().join("-"));
            const diffTime = endTime - currentTime;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            setSisaMasa(diffDays > 0 ? `Jabatan berakhir dalam ${diffDays} hari` : `Masa jabatan sudah berakhir`);
        }
    }, [currentTime, masaAkhir]);

    return (
        <p>{sisaMasa}</p>
    );
};

const ShowDataPegawai = () => {
    const [pegawai, setPegawai] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAll, setShowAll] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('https://back-fix-laps.vercel.app/api/get-data');

                if (!response.status === 200) {
                    throw new Error('Respon tidak baik: ' + response.status);
                }

                const result = response.data;
                console.log('Data yang diterima:', result);

                if (result.data && Array.isArray(result.data)) {
                    const pegawaiData = result.data.map((item) => ({
                        name: item[1],
                        imageId: item[0],
                        date: item[3],
                    }));
                    setPegawai(pegawaiData);
                } else {
                    throw new Error('Data tidak dalam format array atau tidak ada data.');
                }
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="container mt-4">
            <div className="row">
                {(showAll ? pegawai : pegawai.slice(0, 4)).map((peg, index) => (
                    <div className="col-md-6 mb-4" key={index}>
                        <div className="card">
                            <iframe
                                src={`https://drive.google.com/file/d/${peg.imageId}/preview`}
                                alt={peg.name}
                                style={{ width: '100%', height: '200px' }}
                                title={peg.name}
                            />
                            <div className="card-body">
                                <h5 className="card-title">{peg.name}</h5>
                                <p className="card-text">{peg.date}</p>
                                <MasaJabatan masaAkhir={peg.date} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="text-center mt-4">
                <button className="btn btn-success mt-3" onClick={() => navigate('/detail-pegawai')}>
                    Tampilkan Semua
                </button>
            </div>
        </div>
    );
};

export default ShowDataPegawai;
