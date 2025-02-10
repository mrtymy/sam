import React from 'react';
const STATUS_TEXT = {
  online: 'Oyunda',
  offline: 'Boşta'
};

const GameCard = ({ game, accounts = [], activeAccount, handleSteamLogin }) => {
    const sortedAccounts = accounts
        .filter((acc) => acc.game_id === game.id)
        .sort((a, b) => b.status - a.status);

    const isAccountActive = !!activeAccount;  // Aktif bir hesap olup olmadığını kontrol et

    return (
        <div className="card">
            <h2 className="game-title">{game.game_name}</h2>
            <img src={game.game_image} alt={game.game_name} className="game-image" />
            <div className="accounts">
                <ul className="account-list">
                    {sortedAccounts.map((acc) => (
                        <li key={acc.id}>
                            <span
                                className={`account-name bg-warning p-2`}
                                onClick={() => {
                                    if (!isAccountActive && acc.status === 0) {
                                        handleSteamLogin(acc.username, acc.password);
                                    } else {
                                        alert("Önce mevcut hesaptan çıkış yapmalısınız!"); // Uyarı mesajı
                                    }
                                }}
                                style={{ 
                                    cursor: !isAccountActive && acc.status === 0 ? 'pointer' : 'not-allowed', 
                                    textDecoration: 'none'
                                }}
                            >
                                {acc.username}
                            </span>
                            <span className={`status ${acc.status === 1 ? 'online' : 'offline'}`}>
    {acc.status === 1 ? STATUS_TEXT.online : STATUS_TEXT.offline}
</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default GameCard;
