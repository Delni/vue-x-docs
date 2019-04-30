/*************** SEARCH - AUTOCOMPLETE ***************/
var $searchContainer = $('#search-container')
var $searchInput = $searchContainer.find('input')
var $searchedList = $searchContainer.find('ul')
var $anchorList = $('nav ul li a')
var $selected = $()
var $lnb = $('#nav')

var KEY_CODE_UP = 38
var KEY_CODE_DOWN = 40
var KEY_CODE_ENTER = 13

$(window).on('click', function(event) {
	if (!$searchContainer[0].contains(event.target)) {
		clear()
	}
})

$searchedList.on('click', 'li', function(event) {
	var currentTarget = event.currentTarget
	var url = $(currentTarget).find('a').attr('href')

	moveToPage(url)
})

$searchInput.on({
	keyup: onKeyupSearchInput,
	keydown: onKeydownInput
})

function onKeyupSearchInput(event) {
	var inputText = removeWhiteSpace($searchInput.val()).toLowerCase()
	$searchedList.removeClass('empty')
	if (event.keyCode === KEY_CODE_UP || event.keyCode === KEY_CODE_DOWN) {
		return
	}

	if (!inputText) {
		$searchedList.html('')
		$searchedList.addClass('empty')
		return
	}

	if (event.keyCode === KEY_CODE_ENTER) {
		onKeyupEnter()
		return
	}

	setList(inputText)
}

function onKeydownInput(event) {
	$selected.removeClass('highlight')

	switch(event.keyCode) {
		case KEY_CODE_UP:
			$selected = $selected.prev()
			if (!$selected.length) {
				$selected = $searchedList.find('li').last()
			}
			break
		case KEY_CODE_DOWN:
			$selected = $selected.next()
			if (!$selected.length) {
				$selected = $searchedList.find('li').first()
			}
			break
		default: break
	}

	$selected.addClass('highlight')
}

function onKeyupEnter() {
	if (!$selected.length) {
		$selected = $searchedList.find('li').first()
	}
	moveToPage($selected.find('a').attr('href'))
}

function moveToPage(url) {
	if (url) {
		window.location = url
	}
	clear()
}

function clear() {
	$searchedList.html('')
	$searchInput.val('')
	$selected = $()
}

function setList(inputText) {
	var html = ''

	$anchorList.filter(function(idx, item) {
		return isMatched(item.text, inputText)
	}).each(function(idx, item) {
		html += makeListItemHtml(item, inputText)
	})
	$searchedList.html(html)
}

function isMatched(itemText, inputText) {
	return removeWhiteSpace(itemText).toLowerCase().indexOf(inputText) > - 1
}

function makeListItemHtml(item, inputText) {
	var itemText = item.text
	var itemHref = item.href
	var $parent = $(item).closest('div')
	var memberof = ''

	if ($parent.length && $parent.attr('id')) {
		memberof = $parent.attr('id').replace('_sub', '')
	} else {
		memberof = $(item).closest('div').find('h3').text()
	}

	if (memberof) {
		memberof = '<span class="group">' + (memberof !== 'vue-view' ? memberof : 'root') + '</span>'
	}

	itemText = itemText.replace(new RegExp(inputText, 'ig'), function(matched) {
		return '<strong>' + matched + '</strong>'
	})

	return '<li><a href="' + itemHref + '">' + itemText + '</a>' + memberof + '</li>'
}

function removeWhiteSpace(value) {
	return value.replace(/\s/g, '')
}

/*************** TOOGLE SUB NAV ***************/
function toggleSubNav(e) {
	$(e.currentTarget).next().next().toggleClass('show')
	const text = $(e.currentTarget).find('.toggler').text()
	$(e.currentTarget).find('.toggler').html(text === '+' ? '-': '+')
}

$lnb.find('li').each(function() {
	$(this).find('.toggle-subnav')
		.filter(function() {
			return $(this).next(':empty').length === 0
		}).each(function() {
			$(this).removeClass('show').on('click', toggleSubNav)
		})
})
