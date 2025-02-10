import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { API_BASE_URL } from '../config.js';
import './styles.scss';
import GameCard from './GameCard.js'; // GameCard'ı import ediyoruz

function App() {
    const [games, setGames] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeAccount, setActiveAccount] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
            fetchData(token);
        } else {
            setIsLoggedIn(false);
        }
    }, []);

    const handleLogin = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}?action=login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ email, password })
            });
            const data = await response.json();
            if (data.success) {
                localStorage.setItem('token', data.token);
                setIsLoggedIn(true);
                fetchData(data.token);
            } else {
                setError(data.error);
            }
        } catch (error) {
            setError('Login hatası: ' + error.message);
        }
    };

    const fetchData = async (token) => {
        try {
            if (!token) {
                token = localStorage.getItem('token');
            }
            if (!token) {
                throw new Error('User not logged in');
            }

            const response = await fetch(`${API_BASE_URL}?action=getGamesAndAccounts`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            }

            setGames(data.games);
            setAccounts(data.accounts);

            const activeAcc = data.accounts ? data.accounts.find(acc => acc.status === 1) : null;
            if (activeAcc) {
                setActiveAccount(activeAcc.username);
            }
        } catch (error) {
            setError('Error fetching data: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSteamLogin = async (username, password) => {
        window.electronAPI.launchSteam(username, password);

        try {
            const response = await fetch(`${API_BASE_URL}?action=updateAccountStatus`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: new URLSearchParams({ username, status: "1" }) // Hesabı online yap
            });

            const data = await response.json();
            if (data.success) {
                fetchData();
            } else {
                console.error('Account status update failed:', data.error);
            }
        } catch (error) {
            console.error('Error updating account status:', error);
        }

        // Her 10 saniyede Steam'i ve login değişimini kontrol et
        setInterval(async () => {
            const steamRunning = await checkSteamRunning();
            const loginChanged = await checkSteamLoginChange();

            if (!steamRunning || loginChanged) {
                console.log('Steam çalışmıyor veya kullanıcı değişti, hesap boşa düşüyor.');

                // Steam açılmadı veya login değiştiyse hesabı boşa düşür
                try {
                    const response = await fetch(`${API_BASE_URL}?action=updateAccountStatus`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: new URLSearchParams({ username, status: "0" }) // Hesabı offline yap
                    });

                    const data = await response.json();
                    if (data.success) {
                        fetchData(); // Veriyi güncelle
                    } else {
                        console.error('Failed to reset account status:', data.error);
                    }
                } catch (error) {
                    console.error('Error resetting account status:', error);
                }
            }
        }, 10000); // Her 10 saniyede bir kontrol et
    };

    const handleSteamLogout = async () => {
        if (activeAccount) {
            try {
                const response = await fetch(`${API_BASE_URL}?action=updateAccountStatus`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({ username: activeAccount, status: 0 })
                });

                const data = await response.json();
                if (data.success) {
                    window.electronAPI.killSteam();
                    setActiveAccount(null);
                    setAccounts(accounts.map(acc =>
                        acc.username === activeAccount ? { ...acc, status: 0 } : acc
                    ));
                } else {
                    console.error('DB durumu güncellenemedi:', data.error);
                }
            } catch (error) {
                console.error('Logout hatası:', error);
            }
        }
    };

    // Steam'in çalışıp çalışmadığını kontrol eden fonksiyon
    const checkSteamRunning = () => {
        return new Promise((resolve) => {
            window.electronAPI.checkSteamProcess((isRunning) => {
                resolve(isRunning); // Eğer Steam çalışıyorsa true döner
            });
        });
    };

    // Steam login değişimini kontrol eden fonksiyon
    const checkSteamLoginChange = () => {
        return new Promise((resolve) => {
            window.electronAPI.checkSteamLoginChange((hasChanged) => {
                resolve(hasChanged); // Eğer login değiştiyse true döner
            });
        });
    };

    // Slider ayarları
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,  // Otomatik kaydırmayı ekliyoruz
        autoplaySpeed: 3000,  // Otomatik kaydırma hızı
        centerMode: true,
        centerPadding: '0px',
        focusOnSelect: true,
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                },
            },
        ],
    };

    if (!isLoggedIn) {
        return (
            <div className="container mt-5">
                <h2>Login to Steam Account Manager</h2>
                {error && <p className="alert alert-danger">{error}</p>}
                <div className="mb-3">
                    <label>Email:</label>
                    <input
                        type="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                    />
                </div>
                <div className="mb-3">
                    <label>Password:</label>
                    <input
                        type="password"
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                    />
                </div>
                <button className="btn btn-primary" onClick={handleLogin}>Login</button>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <h1>Steam Account Manager</h1>
            {error && <p className="alert alert-danger">{error}</p>}

            {activeAccount && (
                <button className="btn btn-danger mb-3" onClick={handleSteamLogout}>
                    Hesaptan Çık
                </button>
            )}

            {isLoading ? (
                <p>Loading games...</p>
            ) : (
                <Slider {...settings}>
                    {games.length > 0 ? (
                        games.map(game => (
                            <GameCard
                                key={game.id}
                                game={game}
                                gameImage={game.imageUrl}  // Resim URL'si buradan geliyor
                                accounts={accounts}
                                activeAccount={activeAccount}
                                handleSteamLogin={handleSteamLogin}
                            />
                        ))
                    ) : (
                        <p>No games found.</p>
                    )}
                </Slider>
            )}
        </div>
    );
}

// React 18 API'si ile kök oluşturun ve bileşeni render edin
const rootElement = document.getElementById('app');
const root = ReactDOM.createRoot(rootElement);
root.render(<App />);
