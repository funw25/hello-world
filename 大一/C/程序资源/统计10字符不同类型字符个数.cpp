#include<stdio.h>
int main()
{
	int i,letter=0,blank=0,digit=0,other=0;
	char ch;
	for(i=0;i<10;i++)
	{
		ch=getchar();
		if((ch>='a'&&i<='z')||(ch>='A'&&i<='Z'))
		{
			letter++;
		}
		else if(ch==' '){
			blank++;
		}
		else if(ch>='0'&&ch<='9'){
			digit++;
		}
		else{
			other++; 
		}
	}
	printf("letter=%d,blank=%d,digit=%d,other=%d",letter,blank,digit,other); 
	return 0;
}
