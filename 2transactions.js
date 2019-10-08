import React from 'react';
import { Text } from 'react-native';
import "./shim";
const bitcoin = require("bitcoinjs-lib");
const bip39 = require('bip39');

const TestNet = bitcoin.networks.testnet;                  // подключаем сеть, если не нужна тестовая сеть, то не подключаем:)

const App = () => {

  // не HD кошелек !!!!

  const phrase_2 = 'test2 phrase2 www2 qqq2 rtye2 kgjgy2 kdsdb2 hgkgo2 ngyv2 nghgdft2 jgydcf2 nfjbdt2';                           // фраза из которой сделаем сидовую фразу
  const seed_2 = bip39.mnemonicToSeedSync(phrase_2);           // делаем сидовую фразу
  var ourWallet_2 = bitcoin.bip32.fromSeed(seed_2, TestNet);   // создаем кошелек с ключами прив/публ из сидовой фразы, второй параметр - сеть, по дефолту - mainnet, ставим тест
  console.log('ourWallet-------->', ourWallet_2);
  const { address: address_2 } = bitcoin.payments.p2pkh({ pubkey: ourWallet_2.publicKey, network: TestNet });  // адресс кошелька, если указываем тестнет - то он тестовый. иначе приватный
  const publicKey_2 = ourWallet_2.publicKey.toString('hex');   // публичный ключ кошелька (он же адресс), в формате строки-хэша (вдруг пригодится:).
  let privateKey_2 = ourWallet_2.toWIF();   // приватный ключ кошелька, закодированный в WIF
  console.log(`Public key_2----------> ${publicKey_2}`);
  console.log(`Private key_2--------> ${privateKey_2}`);
  console.log(`Adress_2-------------> ${address_2}`);

  //-------------------------------------------------------------------------------------------------------------------------------------------------------------//

  const phrase = 'test phrase www qqq rtye kgjgy kdsdb hgkgo ngyv nghgdft jgydcf nfjbdt';                           // фраза из которой сделаем сидовую фразу
  const seed = bip39.mnemonicToSeedSync(phrase);           // делаем сидовую фразу
  var ourWallet = bitcoin.bip32.fromSeed(seed, TestNet);   // создаем кошелек с ключами прив/публ из сидовой фразы, второй параметр - сеть, по дефолту - mainnet, ставим тест
  console.log('ourWallet-------->', ourWallet);
  const { address } = bitcoin.payments.p2pkh({ pubkey: ourWallet.publicKey, network: TestNet });  // адресс кошелька, если указываем тестнет - то он тестовый. иначе приватный
  const publicKey = ourWallet.publicKey.toString('hex');   // публичный ключ кошелька (он же адресс), в формате строки-хэша (вдруг пригодится:).
  let privateKey = ourWallet.toWIF();   // приватный ключ кошелька, закодированный в WIF
  console.log(`Public key----------> ${publicKey}`);
  console.log(`Private key--------> ${privateKey}`);
  console.log(`Adress-------------> ${address}`);

  const txId_first = '68d915a19d50b2139139dcdfced41eba509a654ec93c65c9793b6bdd0f73064b';
  const txId_second = '5b2e76f3916e7e10ca55ef638e668f8dc0a01fed5acb10535f456d17c8a021cb';
  // id предыдущей транзакции, чтобы его получить надо отправить транзакцию на свой адресс через fauset (тестовая сеть битка)
  // например вот: https://coinfaucet.eu/en/btc-testnet/    (одна транзакция в 12 часов), потом на тестовом серваке: https://live.blockcypher.com/btc-testnet/ 
  // проверить свой созданный адресс  (и в нем будет тестовая транзакция, содержащая свой ID)


  let tx_new = new bitcoin.TransactionBuilder(TestNet);  //инициируем транзакцию

  tx_new.addInput(txId_first, 0);    // добавляем инпут - ID предыдущей транзакции (которая содержит деньги, ПОСТУПИВШИЕ в кошелек, наш кошелек состоит из транзакций),
  // второй аргумент - это индекс результата в этой транзакции, 0
  tx_new.addInput(txId_second, 0);

  tx_new.addOutput(address_2, 3276363);  // адресс кошелька на КОТОРЫЙ будем отправлять деньги, второй аргумент - количество отправляемых денег в satoshi
  // 1 BTC = 100 000 000 satoshi
  tx_new.addOutput(address, 50000);
  //--------------------------------------------------------------------------------------------------//
  //каждый раз мы отправляем всю сумму, но если хотим сдачу - мы пишем еще один аутпут. Т.е. первый аутпут - это кому мы хотим отправить часть денег (адресс получателя)
  // второй аутпут - сдача (т.е. общая сумма - сумма, которую хотим отправить), здесь указываем наш собственный адресс
  // также надо учитывать fee - это комиссия за перевод майнеру. ее надо вычитать из сдачи (возвращать не точную сдачу себе, а сумма-комиссия)
  //--------------------------------------------------------------------------------------------------//

  const privateSign = bitcoin.ECPair.fromWIF(privateKey, TestNet) // формируем приватную подпись из нашего приватного ключа, полученного из сидовой фразы, тестовая сеть

  tx_new.sign(0, privateSign);   // подписываем нашу транзакцию. 0 - Первый аргумент, vin, относится к индексу входных данных, с которыми мы подписываемся.
  // В этом случае, поскольку мы добавили только 1 вход, наш vin равен 0, второй аргумент - приватная подпись
    tx_new.sign(1, privateSign);
  let tx_new_hex = tx_new.build().toHex()  // в конце создаем транзакцию из указанных выше инпута (откуда берем деньги) и аутпутов (на какие адреса отправляем),
  //  хэшируем ее в шестнадцатеричное значение
  // проверить правильность транзакции можно тут: https://live.blockcypher.com/btc-testnet/decodetx/  (вставляем получившийся хэш сюда, декодируем)
  // если все ок - выше будет наша раскодированная транзакция


  //------------------------------------------------------------------------------------------------------
  // все эти шаги можно делать не в тестовой сети а в реально - если не указывать testNet.
  // сервисы для проверки в реальной сети:
  // https://www.blockchain.com/explorer               (адресс со всеми транзакциями, грубо говоря аккаунт)
  // https://www.blockchain.com/btc/decode-tx          (сервис для декодирования хэша готовой транзакции tx_hex и проверки валидная она или нет)

  console.log('transaction------------------->', tx_new_hex)

  return (
    <>
      <Text>RN</Text>
    </>
  );
};

export default App;

