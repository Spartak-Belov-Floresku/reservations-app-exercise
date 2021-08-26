$().ready(()=>{
    
    const $searchUser = $('#search')
    const $resultSearch = $('#result_search')

    //method runs ajax request to the server to search customers
    const serchCustomers = async (val) =>{

        $resultSearch.find('li').remove();
        if(val.match(/^[A-Za-z]+$/)){
            try{
                const results = await axios.get(`/search/${val}`);

                if(results.data.customers){
                    results.data.customers.forEach(customer => {
                        let li = $(`<li><a href=/${customer.id}/>${customer.fullName}</a></li>`)
                        $resultSearch.append(li)
                    });
                }else{
                    let li = $(`<li>No matches</li>`)
                    $resultSearch.append(li)
                }

            }catch(err){

                console.log(err)
            }
        }
        
    }

    //assing event listener to the imput field to triger method

    $searchUser.keyup(() => {serchCustomers($searchUser.val()) });

});
