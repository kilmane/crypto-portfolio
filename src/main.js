import * as XLSX from 'xlsx';

// State to store all portfolio data
let portfolioData = {
  wallets: [],
  assets: {}
};

// DOM Elements
const walletNameInput = document.getElementById('walletName');
const addWalletBtn = document.getElementById('addWalletBtn');
const walletsContainer = document.getElementById('walletsContainer');
const summaryBody = document.getElementById('summaryBody');
const exportBtn = document.getElementById('exportBtn');

// Add event listeners
addWalletBtn.addEventListener('click', addWallet);
exportBtn.addEventListener('click', exportToExcel);

// Function to add a new wallet or exchange
function addWallet() {
  const walletName = walletNameInput.value.trim();
  
  if (!walletName) {
    alert('Please enter a wallet or exchange name');
    return;
  }
  
  // Check if wallet name already exists
  if (portfolioData.wallets.some(wallet => wallet.name === walletName)) {
    alert('A wallet or exchange with this name already exists');
    return;
  }
  
  // Create new wallet object
  const newWallet = {
    id: Date.now().toString(),
    name: walletName,
    assets: []
  };
  
  // Add to portfolio data
  portfolioData.wallets.push(newWallet);
  
  // Clear input
  walletNameInput.value = '';
  
  // Render the wallet
  renderWallet(newWallet);
  
  // Update summary
  updateSummary();
}

// Function to render a wallet in the UI
function renderWallet(wallet) {
  const walletElement = document.createElement('div');
  walletElement.className = 'wallet-container';
  walletElement.id = `wallet-${wallet.id}`;
  
  walletElement.innerHTML = `
    <div class="wallet-header">
      <h3>${wallet.name}</h3>
      <div>
        <button class="add-asset-btn" data-wallet-id="${wallet.id}">Add Asset</button>
        <button class="remove-wallet-btn remove-btn" data-wallet-id="${wallet.id}">Remove</button>
      </div>
    </div>
    <div class="asset-form" style="display: none;">
      <div class="form-group">
        <label for="assetName-${wallet.id}">Asset Name:</label>
        <input type="text" id="assetName-${wallet.id}" placeholder="Enter crypto asset name (e.g., Bitcoin)">
      </div>
      <div class="form-group">
        <label for="assetAmount-${wallet.id}">Amount:</label>
        <input type="number" id="assetAmount-${wallet.id}" step="0.000001" placeholder="Enter amount">
      </div>
      <button class="save-asset-btn" data-wallet-id="${wallet.id}">Save Asset</button>
    </div>
    <div class="asset-list" id="asset-list-${wallet.id}">
      ${renderAssetList(wallet.assets)}
    </div>
  `;
  
  walletsContainer.appendChild(walletElement);
  
  // Add event listeners for the new wallet
  const addAssetBtn = walletElement.querySelector('.add-asset-btn');
  const saveAssetBtn = walletElement.querySelector('.save-asset-btn');
  const removeWalletBtn = walletElement.querySelector('.remove-wallet-btn');
  
  addAssetBtn.addEventListener('click', () => {
    const assetForm = walletElement.querySelector('.asset-form');
    assetForm.style.display = assetForm.style.display === 'none' ? 'block' : 'none';
  });
  
  saveAssetBtn.addEventListener('click', () => {
    const walletId = saveAssetBtn.getAttribute('data-wallet-id');
    addAsset(walletId);
  });
  
  removeWalletBtn.addEventListener('click', () => {
    const walletId = removeWalletBtn.getAttribute('data-wallet-id');
    removeWallet(walletId);
  });
}

// Function to render the asset list for a wallet
function renderAssetList(assets) {
  if (assets.length === 0) {
    return '<p>No assets added yet.</p>';
  }
  
  return assets.map(asset => `
    <div class="asset-item">
      <div>
        <strong>${asset.name}</strong>: ${asset.amount}
      </div>
      <button class="remove-asset-btn remove-btn" data-wallet-id="${asset.walletId}" data-asset-id="${asset.id}">Remove</button>
    </div>
  `).join('');
}

// Function to add a new asset to a wallet
function addAsset(walletId) {
  const wallet = portfolioData.wallets.find(w => w.id === walletId);
  
  if (!wallet) return;
  
  const assetNameInput = document.getElementById(`assetName-${walletId}`);
  const assetAmountInput = document.getElementById(`assetAmount-${walletId}`);
  
  const assetName = assetNameInput.value.trim();
  const assetAmount = parseFloat(assetAmountInput.value);
  
  if (!assetName) {
    alert('Please enter an asset name');
    return;
  }
  
  if (isNaN(assetAmount) || assetAmount <= 0) {
    alert('Please enter a valid amount');
    return;
  }
  
  // Create new asset object
  const newAsset = {
    id: Date.now().toString(),
    walletId: walletId,
    name: assetName,
    amount: assetAmount
  };
  
  // Add to wallet
  wallet.assets.push(newAsset);
  
  // Update the asset list in the UI
  const assetListElement = document.getElementById(`asset-list-${walletId}`);
  assetListElement.innerHTML = renderAssetList(wallet.assets);
  
  // Add event listeners for remove buttons
  const removeAssetBtns = assetListElement.querySelectorAll('.remove-asset-btn');
  removeAssetBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const walletId = btn.getAttribute('data-wallet-id');
      const assetId = btn.getAttribute('data-asset-id');
      removeAsset(walletId, assetId);
    });
  });
  
  // Clear inputs
  assetNameInput.value = '';
  assetAmountInput.value = '';
  
  // Hide the form
  const assetForm = document.querySelector(`#wallet-${walletId} .asset-form`);
  assetForm.style.display = 'none';
  
  // Update summary
  updateSummary();
}

// Function to remove an asset
function removeAsset(walletId, assetId) {
  const wallet = portfolioData.wallets.find(w => w.id === walletId);
  
  if (!wallet) return;
  
  // Remove asset from wallet
  wallet.assets = wallet.assets.filter(asset => asset.id !== assetId);
  
  // Update the asset list in the UI
  const assetListElement = document.getElementById(`asset-list-${walletId}`);
  assetListElement.innerHTML = renderAssetList(wallet.assets);
  
  // Add event listeners for remove buttons
  const removeAssetBtns = assetListElement.querySelectorAll('.remove-asset-btn');
  removeAssetBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const walletId = btn.getAttribute('data-wallet-id');
      const assetId = btn.getAttribute('data-asset-id');
      removeAsset(walletId, assetId);
    });
  });
  
  // Update summary
  updateSummary();
}

// Function to remove a wallet
function removeWallet(walletId) {
  // Remove wallet from portfolio data
  portfolioData.wallets = portfolioData.wallets.filter(wallet => wallet.id !== walletId);
  
  // Remove wallet element from UI
  const walletElement = document.getElementById(`wallet-${walletId}`);
  if (walletElement) {
    walletElement.remove();
  }
  
  // Update summary
  updateSummary();
}

// Function to fetch price from CoinGecko
async function fetchPrice(assetName) {
  try {
    // Convert asset name to lowercase and replace spaces with hyphens for API compatibility
    const coinId = assetName.toLowerCase().replace(/\s+/g, '-');
    
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`);
    const data = await response.json();
    
    if (data[coinId] && data[coinId].usd) {
      return data[coinId].usd;
    } else {
      throw new Error('Price not found');
    }
  } catch (error) {
    console.error('Error fetching price:', error);
    alert(`Could not fetch price for ${assetName}. Please check the asset name and try again.`);
    return null;
  }
}

// Function to update the summary table
function updateSummary() {
  // Reset assets summary
  portfolioData.assets = {};
  
  // Aggregate assets from all wallets
  portfolioData.wallets.forEach(wallet => {
    wallet.assets.forEach(asset => {
      if (!portfolioData.assets[asset.name]) {
        portfolioData.assets[asset.name] = {
          totalAmount: 0,
          livePrice: null,
          liveValue: null
        };
      }
      
      portfolioData.assets[asset.name].totalAmount += asset.amount;
    });
  });
  
  // Render summary table
  let summaryHTML = '';
  
  Object.entries(portfolioData.assets).forEach(([assetName, assetData]) => {
    const livePrice = assetData.livePrice !== null ? `$${assetData.livePrice.toFixed(2)}` : 'Not fetched';
    const liveValue = assetData.livePrice !== null ? `$${(assetData.totalAmount * assetData.livePrice).toFixed(2)}` : 'N/A';
    
    summaryHTML += `
      <tr>
        <td>${assetName}</td>
        <td>${assetData.totalAmount}</td>
        <td>
          ${livePrice}
          <button class="fetch-price-btn" data-asset="${assetName}">Fetch Price</button>
        </td>
        <td>${liveValue}</td>
      </tr>
    `;
  });
  
  summaryBody.innerHTML = summaryHTML || '<tr><td colspan="4">No assets added yet</td></tr>';
  
  // Add event listeners for fetch price buttons
  const fetchPriceBtns = summaryBody.querySelectorAll('.fetch-price-btn');
  fetchPriceBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const assetName = btn.getAttribute('data-asset');
      const price = await fetchPrice(assetName);
      
      if (price !== null) {
        // Update portfolio data
        portfolioData.assets[assetName].livePrice = price;
        
        // Update UI
        updateSummary();
      }
    });
  });
}

// Function to export data to Excel
function exportToExcel() {
  // Create worksheet for summary
  const summaryData = [
    ['Asset', 'Total Amount', 'Live Price (USD)', 'Live Value (USD)']
  ];
  
  Object.entries(portfolioData.assets).forEach(([assetName, assetData]) => {
    const livePrice = assetData.livePrice !== null ? assetData.livePrice : 'Not fetched';
    const liveValue = assetData.livePrice !== null ? (assetData.totalAmount * assetData.livePrice) : 'N/A';
    
    summaryData.push([
      assetName,
      assetData.totalAmount,
      livePrice,
      liveValue
    ]);
  });
  
  const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
  
  // Create worksheets for each wallet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, summaryWS, 'Portfolio Summary');
  
  portfolioData.wallets.forEach(wallet => {
    if (wallet.assets.length > 0) {
      const walletData = [
        ['Asset', 'Amount']
      ];
      
      wallet.assets.forEach(asset => {
        walletData.push([
          asset.name,
          asset.amount
        ]);
      });
      
      const walletWS = XLSX.utils.aoa_to_sheet(walletData);
      XLSX.utils.book_append_sheet(wb, walletWS, wallet.name);
    }
  });
  
  // Export the workbook
  XLSX.writeFile(wb, 'crypto_portfolio.xlsx');
}
