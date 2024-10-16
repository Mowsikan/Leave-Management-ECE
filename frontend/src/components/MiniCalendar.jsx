export default function MiniCalendar({ selectRange, onDateChange, ...rest }) {
    const [dateState, setDateState] = useState(new Date());
  
    const changeDate = (e) => {
      setDateState(e);
      onDateChange(e);  // Send the selected date to parent component
    };
  
    return (
      <Card align='center' direction='column' p='50px 15px' {...rest}>
        <Calendar
          onChange={changeDate}
          value={dateState}
          selectRange={selectRange}
          view={"month"}
          tileContent={<Text color='brand.500'></Text>}
          prevLabel={<Icon as={MdChevronLeft} w='24px' h='24px' mt='4px' />}
          nextLabel={<Icon as={MdChevronRight} w='24px' h='24px' mt='4px' />}
        />
        <p id="dateText">
          Current selected date is <b>{moment(dateState).format('MMMM Do YYYY')}</b>
        </p>
      </Card>
    );
  }
  