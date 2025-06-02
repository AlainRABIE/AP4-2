'';

import { useState } from 'react';

interface Forfait {
    id?: string;
    name: string;
    price: number;
    numberOfSessions: number;
    description: string;
}

export default function ForfaitPage() {
    const [forfaits, setForfaits] = useState<Forfait[]>([]);
    const [newForfait, setNewForfait] = useState<Forfait>({
        name: '',
        price: 0,
        numberOfSessions: 1,
        description: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewForfait({
            ...newForfait,
            [name]: name === 'price' || name === 'numberOfSessions' ? Number(value) : value
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!newForfait.name || newForfait.price <= 0 || newForfait.numberOfSessions <= 0) {
            alert("Erreur: Veuillez remplir tous les champs correctement");
            return;
        }
        
        const forfaitWithId = { ...newForfait, id: Date.now().toString() };
        setForfaits([...forfaits, forfaitWithId]);
        
        setNewForfait({
            name: '',
            price: 0,
            numberOfSessions: 1,
            description: ''
        });
        
        alert("Le forfait a été ajouté avec succès");
    };

    const deleteForfait = (id: string) => {
        setForfaits(forfaits.filter(forfait => forfait.id !== id));
        alert("Le forfait a été supprimé avec succès");
    };

    return (
        <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "1rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1.5rem" }}>Gestion des forfaits</h1>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
                <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "1rem" }}>
                    <div style={{ marginBottom: "1rem" }}>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: "bold" }}>Ajouter un nouveau forfait</h2>
                        <p style={{ color: "#666" }}>Créez un forfait pour vos séances de coaching</p>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: "1rem" }}>
                            <div style={{ marginBottom: "0.5rem" }}>
                                <label htmlFor="name" style={{ display: "block", marginBottom: "0.25rem" }}>Nom du forfait</label>
                                <input 
                                    id="name" 
                                    name="name" 
                                    value={newForfait.name} 
                                    onChange={handleInputChange} 
                                    placeholder="Ex: Pack 10 séances"
                                    style={{ width: "100%", padding: "0.5rem", border: "1px solid #ddd", borderRadius: "4px" }}
                                />
                            </div>
                            
                            <div style={{ marginBottom: "0.5rem" }}>
                                <label htmlFor="price" style={{ display: "block", marginBottom: "0.25rem" }}>Prix (€)</label>
                                <input 
                                    id="price" 
                                    name="price" 
                                    type="number" 
                                    min="0" 
                                    step="0.01" 
                                    value={newForfait.price} 
                                    onChange={handleInputChange}
                                    style={{ width: "100%", padding: "0.5rem", border: "1px solid #ddd", borderRadius: "4px" }}
                                />
                            </div>
                            
                            <div style={{ marginBottom: "0.5rem" }}>
                                <label htmlFor="numberOfSessions" style={{ display: "block", marginBottom: "0.25rem" }}>Nombre de séances</label>
                                <input 
                                    id="numberOfSessions" 
                                    name="numberOfSessions" 
                                    type="number" 
                                    min="1" 
                                    value={newForfait.numberOfSessions} 
                                    onChange={handleInputChange}
                                    style={{ width: "100%", padding: "0.5rem", border: "1px solid #ddd", borderRadius: "4px" }}
                                />
                            </div>
                            
                            <div style={{ marginBottom: "0.5rem" }}>
                                <label htmlFor="description" style={{ display: "block", marginBottom: "0.25rem" }}>Description</label>
                                <textarea 
                                    id="description" 
                                    name="description" 
                                    value={newForfait.description} 
                                    onChange={handleInputChange} 
                                    placeholder="Détails du forfait..."
                                    style={{ width: "100%", padding: "0.5rem", border: "1px solid #ddd", borderRadius: "4px", minHeight: "100px" }}
                                />
                            </div>
                        </div>
                        <div>
                            <button 
                                type="submit"
                                style={{ 
                                    backgroundColor: "#2563eb", 
                                    color: "white", 
                                    padding: "0.5rem 1rem", 
                                    borderRadius: "4px",
                                    border: "none",
                                    cursor: "pointer"
                                }}
                            >
                                Ajouter le forfait
                            </button>
                        </div>
                    </form>
                </div>
                
                <div>
                    <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem" }}>Forfaits disponibles</h2>
                    {forfaits.length === 0 ? (
                        <p style={{ color: "#666" }}>Aucun forfait n'a été créé</p>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {forfaits.map((forfait) => (
                                <div key={forfait.id} style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "1rem" }}>
                                    <div style={{ marginBottom: "0.5rem" }}>
                                        <h3 style={{ fontSize: "1.125rem", fontWeight: "bold" }}>{forfait.name}</h3>
                                        <p style={{ color: "#666" }}>
                                            {forfait.numberOfSessions} séance{forfait.numberOfSessions > 1 ? 's' : ''} - {forfait.price}€
                                        </p>
                                    </div>
                                    <div style={{ marginBottom: "1rem" }}>
                                        <p>{forfait.description}</p>
                                    </div>
                                    <div>
                                        <button 
                                            onClick={() => forfait.id && deleteForfait(forfait.id)}
                                            style={{ 
                                                backgroundColor: "#ef4444", 
                                                color: "white", 
                                                padding: "0.25rem 0.75rem", 
                                                fontSize: "0.875rem",
                                                borderRadius: "4px",
                                                border: "none",
                                                cursor: "pointer"
                                            }}
                                        >
                                            Supprimer
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}