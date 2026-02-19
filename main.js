import React, { useState, useEffect } from 'react';

const BASE_URL = 'https://botfilter-h5ddh6dye8exb7ha.centralus-01.azurewebsites.net';

const JobBoard = () => {
  const [jobs, setJobs] = useState([]);
  const [candidate, setCandidate] = useState(null);
  const [repoUrl, setRepoUrl] = useState(''); // URL del Step 1
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Step 2 & 3: Cargar datos al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. Obtener datos del candidato 
        const resCandidate = await fetch(`${BASE_URL}/api/candidate/get-by-email?email=alejandroromantelli@hotmail.com`);
        const dataCandidate = await resCandidate.json();
        setCandidate(dataCandidate);

        // 2. Obtener lista de posiciones
        const resJobs = await fetch(`${BASE_URL}/api/jobs/get-list`);
        const dataJobs = await resJobs.json();
        setJobs(dataJobs);

      } catch (err) {
        setError("Error al cargar los datos: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Step 5: Enviar postulación
  const handleApply = async (jobId) => {
    if (!repoUrl) return alert("Por favor ingresá la URL del repo");

    const payload = {
      uuid: candidate.uuid,
      jobId: jobId,
      candidateId: candidate.candidateId,
      repoUrl: repoUrl
    };

    try {
      const response = await fetch(`${BASE_URL}/api/candidate/apply-to-job`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (result.ok) {
        alert("¡Postulación enviada con éxito!");
      } else {
        alert("Error: " + (result.message || "No se pudo aplicar"));
      }
    } catch (err) {
      alert("Error de red: " + err.message);
    }
  };

  if (loading) return <p>Cargando posiciones...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h2>Posiciones Abiertas</h2>
      <div style={{ display: 'grid', gap: '15px' }}>
        {jobs.map(job => (
          <div key={job.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
            <h3>{job.title}</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                placeholder="URL de GitHub" 
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                style={{ flex: 1, padding: '8px' }}
              />
              <button 
                onClick={() => handleApply(job.id)}
                style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '8px 15px', cursor: 'pointer' }}
              >
                Submit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobBoard;
