async function getChatsData (chatId) {
	try {
		const res = await fetch(`/chat-list?id=${chatId}`, {
			method: 'GET',
		});
		
		if (res.ok) {
			const { data } = await res.json();
			return data
		} else {
			const newRes = document.createElement("h4");
			newRes.style.color = 'red';
			newRes.innerText = data.message;
			myChats.appendChild(newRes);
		}
	} catch (error) {
		console.error(`Error getChatsData : ${error.message}`);
	}
};

async function getMessageData (chatId) {
	try {
		const res = await fetch(`/find-message?id=${chatId}`, {
			method: 'GET',
		});
		
		if (res.ok) {
			const { data } = await res.json();
			return data.messagesOfChat
		} else {
			const newRes = document.createElement("h4");
			newRes.style.color = 'red';
			newRes.innerText = data.message;
			myChats.appendChild(newRes);
		}
	} catch (error) {
		console.error(`Error getMessageData : ${error.message}`);
	}
};

module.exports = {getChatsData, getMessageData}