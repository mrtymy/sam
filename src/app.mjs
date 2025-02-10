import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { API_BASE_URL } from '../config.js';  // Ana dizindeki yapılandırma dosyasını içe aktar

function App() {
    const [games, setGames] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeAccount, setActiveAccount] = useState(null);
    const [isLoggingOut, setIsLoggingOut] = useState(false); // Logout animasyonu için state

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}?action=getGamesAndAccounts`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            console.log('Fetched data:', data);
            
            setGames(data.games);
            setAccounts(data.accounts);

            const activeAcc = data.accounts.find(acc => acc.status === "1");
            if (activeAcc) {
                setActiveAccount(activeAcc.username);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Error fetching data: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async (username, password) => {
        if (activeAccount) {
            alert('Zaten bir hesap kullanıyorsunuz! Lütfen önce çıkış yapın.');
            return;
        }
    
        console.log('handleLogin fonksiyonu çağrıldı!');
        console.log('Username:', username);
        console.log('Password:', password);
    
        if (!username || !password) {
            console.error('Username or password is missing.');
            setError('Username or password is missing.');
            return;
        }
    
        try {
            const response = await fetch(`${API_BASE_URL}?action=login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ username, password })
            });
    
            const data = await response.json();
            console.log('Login API yanıtı:', data);
    
            if (data.success) {
                console.log('Login başarılı.');
                setAccounts(prevAccounts =>
                    prevAccounts.map(acc => 
                        acc.username === username 
                        ? { ...acc, status: "1" } 
                        : acc
                    )
                );
                setActiveAccount(username);
                window.electronAPI.launchSteam(username, password); // Burada tetikleniyor
            } else {
                console.error('Login failed:', data.error || 'No error message');
                setError(data.error || 'Login failed');
            }
        } catch (error) {
            console.error('Error logging in:', error);
            setError('Error logging in: ' + error.message);
        }
    };
    

    const handleLogout = async () => {
        setIsLoggingOut(true); // Animasyonu başlat
        window.electronAPI.killSteam(); // Steam'i kapat

        // Veritabanını güncellemek için biraz gecikme ekleyelim
        setTimeout(async () => {
            try {
                const response = await fetch(`${API_BASE_URL}?action=logout`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({ username: activeAccount })
                });

                const data = await response.json();
                if (data.success) {
                    console.log('Logout başarılı.');
                    setAccounts(prevAccounts =>
                        prevAccounts.map(acc => 
                            acc.username === activeAccount 
                            ? { ...acc, status: "0" } 
                            : acc
                        )
                    );
                    setActiveAccount(null);
                } else {
                    console.error('Logout failed:', data.error || 'No error message');
                    setError(data.error || 'Logout failed');
                }
            } catch (error) {
                console.error('Error logging out:', error);
                setError('Error logging out: ' + error.message);
            } finally {
                setIsLoggingOut(false); // Animasyonu durdur
            }
        }, 0); // Gecikme süresini 0 yaparak işlemi hemen başlatıyoruz
    };

    return (
        <div className="container mt-5">
            <h1>Steam Account Manager</h1>
            {error && <p className="alert alert-danger">{error}</p>}
            {isLoading ? (
                <p>Loading games...</p>
            ) : (
                <div className="row">
                    {games.map(game => (
                        <GameCard 
                            key={game.id} 
                            game={game} 
                            accounts={accounts} 
                            handleLogin={handleLogin} 
                            activeAccount={activeAccount} 
                        />
                    ))}
                </div>
            )}
            <div className="logout-btn-container">
                <button className="btn btn-secondary mt-3" onClick={handleLogout} disabled={isLoggingOut}>
                    Logout from {activeAccount}
                </button>
                {isLoggingOut && <div className="loading-animation"></div>} {/* Yüklenme animasyonu */}
            </div>
        </div>
    );
}

const GameCard = ({ game, accounts, handleLogin, activeAccount }) => (
    <div className="col-md-4">
        <div className="card mb-4 shadow-sm">
            <img src={game.image_url} className="card-img-top" alt={game.name} />
            <div className="card-body">
                <h5 className="card-title">{game.name}</h5>
                <p className="card-text">Available Accounts:</p>
                <ul>
                    {accounts
                        .filter(acc => acc.game_id === game.id)
                        .map(acc => (
                            <li key={acc.id} className="d-flex align-items-center">
                                <button 
                                    className="btn btn-primary btn-sm account-btn ms-2" 
                                    onClick={() => handleLogin(acc.username, acc.password)}
                                    disabled={acc.status === "1" || activeAccount}
                                >
                                    {acc.username}
                                </button>
                                <span 
                                    className={`status-label ms-2 ${acc.status === "1" ? 'online' : 'offline'}`}
                                >
                                    {acc.status === "1" ? 'Online' : 'Offline'}
                                </span>
                            </li>
                        ))}
                </ul>
            </div>
        </div>
    </div>
);

// React 18 API'si ile kök oluşturun ve bileşeni render edin
const rootElement = document.getElementById('app');
const root = ReactDOM.createRoot(rootElement); 
root.render(<App />);
