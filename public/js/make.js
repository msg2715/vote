document.addEventListener('DOMContentLoaded', function() {
    var textarea = document.querySelector('.content-input');
    const maxLineBreak = 3

    function adjustHeight() {
        this.style.height = '20px'; // 먼저 높이를 자동으로 설정하여 축소할 수 있게 함
        this.style.height = this.scrollHeight + 'px'; // scrollHeight를 사용하여 높이를 조절
    }

    // 'input' 이벤트 리스너를 추가하여 사용자 입력마다 높이 조절
    textarea.addEventListener('input', adjustHeight);

    // 페이지 로드 시 초기 높이 조절
    adjustHeight.call(textarea);

    var textarea = document.querySelector('.content-input');

    function adjustHeight() {
        this.style.height = '20px';
        this.style.height = this.scrollHeight + 'px';
    }

    textarea.addEventListener('input', adjustHeight);
    adjustHeight.call(textarea);




    // 투표 항목 추가 버튼
    const addVoteBtn = document.querySelector('.vote button:first-of-type');
    // 투표 항목 제거 버튼
    const removeVoteBtn = document.querySelector('.vote button:last-of-type');
    // 투표 항목을 담는 부모 요소
    const voteContainer = document.querySelector('.vote');

    let voteCount = 2; // 초기 투표 항목 개수

    // 투표 항목 추가 함수
    function addVoteItem() {
        if (voteCount < 5) { // 항목을 최대 5개까지 제한
            voteCount += 1; // 투표 항목 개수 증가
            const div = document.createElement('div');
            div.classList.add('choice-box');
            div.innerHTML = `<input name="vote${voteCount}" type="text" name="vote" placeholder="항목 입력" maxlength="30" minlength="1">`;
            voteContainer.insertBefore(div, addVoteBtn); // 추가 버튼 이전에 새 항목 삽입
        } else {
            alert('투표 항목은 최대 5개까지만 추가할 수 있습니다.');
        }
    }

    // 투표 항목 제거 함수
    function removeVoteItem() {
        if (voteCount > 2) { // 항목을 최소 2개로 제한
            voteCount -= 1; // 투표 항목 개수 감소
            const choiceBoxes = document.querySelectorAll('.choice-box');
            choiceBoxes[choiceBoxes.length - 1].remove(); // 마지막 투표 항목 제거
        } else {
            alert('투표 항목은 최소 2개가 필요합니다.');
        }
    }

    // 이벤트 리스너 추가
    addVoteBtn.addEventListener('click', addVoteItem);
    removeVoteBtn.addEventListener('click', removeVoteItem);


    const uploadBtn = document.querySelector('.upload');
    const form = document.querySelector('form'); // form 태그 선택
    
    function upload(event) {
        event.preventDefault(); // 이벤트 객체 전달 및 기본 동작 방지
            
        if (!confirm("업로드하시겠습니까?")) {
            return;
        } else {
            form.submit(); // 선택된 form 제출
        }
    }
    
    uploadBtn.addEventListener('click', upload);
});
