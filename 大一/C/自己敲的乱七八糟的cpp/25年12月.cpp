/*#include<stdio.h>
int main(void)
{
	printf("hello world!");
	return 0;
}


#include<stdio.h>
int main(void)
{
	int a=10;
	
	//1.定义一个指针去指向变量 
	int* p=&a;
	//2.利用指针去获取变量中的数据 
	printf("%d\n",*p);
	//3.利用指针去存储数据
	 *p=200;
	 //4.输出打印
	 printf("%d\n",*p);
	  
	  
	  
	  
	char c='a';
	char* p1=&c;
	
	long long n=100;
	long long* p2=&n;
	
	printf("%zu\n",sizeof(p1));
	printf("%zu\n",sizeof(p2));
	return 0;
 } 



 
#include<stdio.h>
void huhuan2(int* p,int* q)
{
	int* t;
	t=p;
	p=q;
	q=t;
	
}
int main(void)
{
	int a=3;
	int b=5;
	
	huhuan2(&a,&b);//定义的是指针变量，写*p  *q 不对，因为主函数里没定义pq
	             //写a和b也不对，因为变量类型不一致 
	printf("a=%d,b=%d\n",a,b);
	return 0;
	


}


//结果依然错误，没有互换 


#include<stdio.h>
void huhuan3(int* p,int* q)
{
	int t;
	t=*p;
    *p=*q;
	*q=t;
	
}
int main(void)
{
	int a=3;
	int b=5;
	
	huhuan3(&a,&b);
	            
	printf("a=%d,b=%d\n",a,b);
	
	return 0;
}

/*

写一个程序，输入为一个整数，输出为该整数的打头数字。例如123的打头数字为1，-123的打头数字为-1。

**输入格式要求："%d" 提示信息："请输入一个整数："
**输出格式要求："该整数以%d打头！\n"


#include<stdio.h>
int tou(int a)
{   int b;
    b=a;
    	 while(b>=10||b<-10)
         b=b/10;
	
	     b=b%10;	
	return b;
}
int main(void)
{
	int a;

	printf("请输入一个整数：");
	scanf("%d",&a);
	
	printf("该整数以%d打头！\n",tou(a));
	
	return 0;
}



//
#include<stdio.h>
int tou(int a)
{   int b;
    b=a;
    while(b!=0)
    b=a/10;	
	
	printf("%d",b);
	return b;
}
int main(void)
{
	int a;

	printf("请输入一个整数：");
	scanf("%d",&a);
	
	printf("该整数以%d打头！\n",tou(a));
	
	return 0;
}




主要问题分析：

循环逻辑错误：

b = a/10; 使用的是原始值 a，而不是更新后的 b

这会导致无限循环，因为 b 不会改变（总是等于 a/10）

循环条件 b!=0 对于某些输入可能永远不会为假

算法逻辑问题：

没有正确处理提取第一位数字的逻辑

没有处理负数的情况

函数内部有打印语句，但主函数也打印，会导致重复输出





*/




/*
计算100~200之间的所有素数之和，请用给定的函数原型实现判别一个数m是否是素数，若m是素数，则函数返回1，否则返回0。
函数原型如下：
       int fun(int m);
说明：
  参  数：m 要进行判断的数；
  返回值：若数 m 是素数，则返回值为1；否则返回值为0  
**输入提示信息: 无
**输入数据格式要求: 无
**输出数据格式要求: "sum=%d\n"



#include<stdio.h>
int fun(int);
int main(void)
{
	int sum=0;
	int m;
	for(m=100;m<=200;m++)
	{
		if(fun(m))
          sum+=m;		
	}
	printf("sum=%d\n",sum);
	
	return 0;
}

int fun(int m)
{
	int j;
	int t=1;
	
	
	for(j=2;j<m;j++)
	  {
	  	if(m%j==0)
	  	  t=0;
	  
	  }
	
	return t;
}


#include<stdio.h>
void f(int*,int*);
int main(void)
{
	int a=3,b=5;
	f(&a,&b);
	printf("%d,%d",a,b);
	return 0;
}
void f(int* i,int* j)
{
	int t;
	t=*i;
	*i=*j;
	*j=t;
	
}




	
#include<stdio.h>
int main(void)
{
	int a[5];//a是数组名，5是数组元素的个数，元素就是变量a[0]~a[4] 
	//int a[3][4];//3行4列，第一个元素是a【0】【0】   a[i]a[j]是第i+1，第j+1列的元素
    int b[5];
    
    // a=b;//错误，因为a是个常量 ，不能把值赋给常量，常量的值不能被改变
	  
	printf("%lf",&a[0]);
	
	
	return 0;
}
 
*/


//如下，传递两个指针过来 

/*
#include<stdio.h>
void getMaxMin(int arr[],int len,int* max,int* min);
int main(void)
{
	int arr[5]={2,7,4,56,0};
	int len=sizeof(arr)/sizeof(int);
	
	int max;
	int min;
	
	getMaxMin(arr,len,&max,&min);
	
	printf("数组的最大值为：%d\n",max);
	printf("数组的最小值为：%d\n",min);
	
	
	return 0;
}
void getMaxMin(int arr[],int len,int* max,int* min)
{
	*max=arr[0];
	*min=arr[0];
	
	for(int i=1;i<len;i++)
	{
		if(arr[i]>*max)
		   *max=arr[i];
		   
		if(arr[i]<*min)
		   *min=arr[i];
		
	}
	 
}



#include<stdio.h>
int main(void)
{
	int a[5]={0,1,2,3,4};
	
	printf("%d\n",a);
	printf("%d",&a[0]);
	return 0;
 } 





#include<stdio.h>
int main(void)	
{
		int a[5];
		int* p;
		p=&a[1];
		int* q;
		q=&a[4];
		
		printf("a[4]和a[1]相隔了%d个单元",q-p);
		
		
		
		return 0;
}
	

#include<stdio.h>
int main(void)
{
	float num;
	
	printf("Input a float number:\n");
	scanf("%f",&num);
	
	int* p;
	p=(int*)&num;
	
	printf("%X",*p);
	
	
	
	return 0;
}


3. 将以下十进制整数化为16位补码（要求补码的机器数用十六进制及十进制表示）
(-10507)10 = (                H)16位补码 = (                 D)16位补码  
说明：后缀字母H、D分别表示十六进制数和十进制数
以下给出手工求解过程：
a.求解方法一：基于二进制位的求补运算

*/

/*
从键盘输入一个二进制非负整数，屏幕上打印输出对应的十进制、八进制和十六进制数，
要求输出的十六进制数中的英文字母为大写字母。
示例输入、输出如下：
Input a binary number:
100110101101?
The number is 2477 in decimal.
The number is 4655 in octal.
The number is 9AD in hexadecimal.
源程序代码：

*/
//ds的代码，很错误

/*

 
#include<stdio.h>
int main(void)
{
	char er[100];
	int i;
	long shi = 0;
	
	printf("Input a binary number:");
	scanf("%c",&er);
	
	for (i = 0; er[i] != '\0'; i++) 
	{
            shi = shi* 2+(er[i]-'0');  
        if (er[i] == '1') 
		{
            shi = shi+ 1;  
        }
	
    }
    
    printf("The number is %ld in decimal. ", shi);  
    printf("The number is %lo in octal. ", shi);    
    printf("The number is %lX in hexadecimal.\n", shi); 
    
	return 0;
}



#include <stdio.h>

int main(void)
{
    char er[101];
    int m, sum=0, k=0, i, j;
    printf("Input a binary number:\n");
    for(i=1;i<=100;i++)
    {
        scanf("%c",&er[i]);

        if(er[i]!='\n')
            k++;
        else
            break;
    }

    for(i=k;i>=1;i--)
    {
        if(er[i]=='1')
        {
            m=1;
            for(j=1;j<=(k-i);j++)
            { m=m*2;
            }
            
            sum+=m;
        }
    }

    printf("The number is %d in decimal.\n",sum);
    printf("The number is %o in octal.\n",sum);
    printf("The number is %X in hexadecimal.\n",sum);
    return 0;
}


#include<stdio.h>
void DecToBin(int a,char b[33]);
int main(void)
{
	int a;
	char b[33];
    scanf("%d",&a);
    
    DecToBin(a,b);

	return 0;
}

void DecToBin(int a, char b[33])
{
		int i;
	for(i=31;i>=0;i--)
	{
		b[i]=((a>>(31-i))&1)+'0';
		
	}
	b[32]='\0';
	printf("%s",b);
}




#include <stdio.h>
unsigned mod(unsigned a, unsigned b, unsigned c);
int main(void)
{
    unsigned int a;
	unsigned int b;
	unsigned int c;
    
    printf("Input unsigned integer numbers a, b, c:\n");
    scanf("%u%u%u", &a,&b,&c);
    printf("%u^%u%%%u=%u\n", a,b,c,mod(a,b,c));
    
    return 0;
}
unsigned mod(unsigned a, unsigned b, unsigned c)
{
    int i;
    unsigned int sum=0;
    for(i=1;i<=32;i++)
    {
        if(((b>>(32-i))&1))
        {
            sum=(sum*2+a)%c;
        }
        else
          sum=sum*2%c;
        
    }
    return sum;
}



	 #include<stdio.h>
		 int main(void)
		 {
		 	int i=-3;
		 	printf("%#X\n",i);
		 	return 0;
		 }


#include<stdio.h>
int main(void)
{
	int i=0xFFFFFFEF;
	printf("%d\n",i);
	//1001010
	
	int j=11111111111111111111111111001010;
	printf("%#X\n",j);
	
	return 0;
}

*/
/*
动态二维数组
方案一：动态分配的一维数组+一级指针寻址


int m;//2维数组行数 
int n;//2维数组列数 
int i,j;//行、列下标 
int* a;

a=(int*)malloc(sizeof(int))

方案二：动态分配的一维数组+动态分配的一级指针数组寻址 
 








*/
/*
#include<stdio.h>
int main(void)
{
	char a='A';
	int b;
	double c=12.5;
	
	char* p=&a;
	int* q=&b;
	double* r=&c;
	
	printf("%d,%d,%d",sizeof(p),sizeof(q),sizeof(r));
	
	return 0;
}
*/ 
/*
#include<stdio.h>
void huhuan3(int* ,int*);
int main(void)
{
	int a=3;
	int b=5;
	
	huhuan3(&a,&b);
	            
	printf("a=%d,b=%d\n",a,b);
	
	return 0;
}

void huhuan3(int* p,int* q)
{
	int t;  
	t=*p;    
    *p=*q;  
	*q=t;
	
}
 



一 
#include<stdio.h>
struct Student
{
	int id;
	float score;
	
};
int main(void)
{
	struct Student stu1={18,100};

	return 0;
 } 



#include<stdio.h>
struct 
{
	int id;
	float score;
 } stu1,stu2;
int main(void)
{
	
	return 0;
} 


#include<stdio.h>
struct Student 
{
	int id;
	float score;
	
};
int main(void)
{
	struct Student stu1={20,100};
	struct Student stu2;
	stu2.id=10;
	stu2.score=100;
	printf("%d %f\n",stu1.id,stu1.score);
	printf("%d %f\n",stu2.id,stu2.score);
	return 0;
}




 #include<stdio.h>
 struct Student 
{
    int age;
  	float score;
};
int main(void)
{
	struct Student st={10,100};
    struct Student* pst;
    //pst 可以存放前面这个类型变量的地址 
    pst=&st;
        	
   	pst->age=10;//第二种方式 
    st.age=10;//第一种方式 
        	
        	
    return 0;
}

   #include<stdio.h>
   struct Student
   {
   	int age;
   	float score;
   	char sex;
   };
   int main(void)
   {
   	struct Student st={19,100.0F,'F'
	   };
	   struct Student *pst=&st;
	   
	   pst->age=100;
	   st.score=200.0F;
	   
	   printf("%d %f",st.age,st.score);
	   
   	return 0;
   }


#include<stdio.h>
   struct Student
   {
   	int age;
   	float score;
   	char sex;
   };
   int main(void)
   {
   	struct Student st={19,100,'F'
	   }; 
	   struct Student *pst=&st;
	   
	   pst->age=100;
	   st.score=200;
	   
	   printf("%d %f",st.age,pst->score) ;
	   
   	return 0;
   }


结构体变量和结构体指针变量作为函数参数传递的问题
#include<stdio.h>
struct Student 
{
	int age;
	char sex;
	char name[100];
};
void InputStudent(struct Student stu);
int main(void)
{
	struct Student st;//① 
	
	InputStudent(st);//对结构体变量输入 
	printf("%d %c %s \n",st.age,st.sex,st.name);
	//OutputStudent（）；对结构体变量输出
	
	return 0; 
	
 } 

void InputStudent(struct Student stu)//本函数无法修改主函数中①的值 
{//而且是静态分配，在这个函数里赋完值 再进如main函数，stu这个变量就没了 
	stu.age=10;
	strcpy(stu.name,"张三");//不能写成stu.name="张三";
	stu.sex='F';	
}



想修改主函数的值，要发送地址（指针） 


#include<stdio.h>
struct Student 
{
	int age;
	char sex;
	char name[100];
};
void InputStudent(struct Student* pstu);
int main(void)
{
	struct Student st; 
	
	InputStudent(&st);//对结构体变量输入 
	printf("%d %c %s \n",st.age,st.sex,st.name);

	return 0; 
	
 } 
/*
void InputStudent(struct Student* pstu)   
//pstu只占 8个字节，
//因为一个变量的地址只用它的第一个字节地地址表示

{
	//所以*pstu 代表st 
	//(*pstu).age  等同于st.age
	 (*pstu).age=10;
	 strcpy(pstu->name,"张三");
	 pstu->sex='F';
	 
	
 } 

*/


/*

#include<stdio.h>
struct Student 
{
	int age;
	char sex;
	char name[100];
};
void InputStudent(struct Student* pstu);
int main(void)
{
	struct Student st; 
	
	InputStudent(&st);//对结构体变量输入 
	//printf("%d %c %s \n",st.age,st.sex,st.name);
	OutputStudent(st);//对结构体变量输出 
	return 0; 
	
 } 

void InputStudent(struct Student* pstu)   
{
	 (*pstu).age=10;
	 strcpy(pstu->name,"张三");
	 pstu->sex='F';
	 
	
 } 
void OutputStudent(struct Student ss)//ss和st是两个不同的变量 
//现在把 st的值赋给ss，两个的内容一模一样，变成一份拷贝 
//能输出 
{
	printf("%d %c %s\n",ss.age,ss.sex,ss.name); 
}

//用指针 


#include<stdio.h>
struct Student 
{
	int age;
	char sex;
	char name[100];
};
void InputStudent(struct Student* pstu);
void OutputStudent(struct Student ss)； 
int main(void)
{
	struct Student st; 
	
	InputStudent(st);//对结构体变量输入 ，必须 发送st的地址 
	//printf("%d %c %s \n",st.age,st.sex,st.name);
	OutputStudent(st);//对结构体变量输出 ，可以发送st的地址，也可以发送st的内容 
	return 0; 
	
 } 

void InputStudent(struct Student* pstu)   
{
	 (*pstu).age=10;
	 strcpy(pstu->name,"张三");
	 pstu->sex='F';
	 
	
 } 

void OutputStudent(struct Student ss)//ss和st是两个不同的变量 
//现在把 st的值赋给ss，两个的内容一模一样，变成一份拷贝 
//因为没有修改变量内容的要求，所以只是接过来是可以的 
{
	printf("%d %c %s\n",ss.age,ss.sex,ss.name); 
}

发送地址好还是发送内容好？ 
        函数里如果是地址，既可以修改，也可以输出
        推荐发送地址
		
		
		
		 
指针的优点之一：
    快速地传递数据，
    占用内存小
    执行速度快 

*/

/*

#include<stdio.h>
void sort(int* a,int len)
{
	int i,j,t;
	for(i=0;i<len-1;++i)
	{
		for(j=0;j<len-1-i;++j)
		{
             if(a[j]>a[j+1])
             {
             	t=a[j];
             	a[j]=a[j+1];
             	a[j+1]=t;
             	
             	
			 }
		}
	}
	
 } 
int main(void)
{
	int a[6]={10,2,8,-8,11,0};
	int i=0;
	
	sort(a,6);
	
	for(i=0;i<6;++i)
	{
		
		printf("%d ",a[i]);
	}
	printf("\n");
	return 0;
}

/*
i=0  0<5
j=0  j<5  ++j

a[0]  a[1]
a[1]  a[2]
a[3]  a[4]
a[4]  a[5]   注意是a[j]和a[j+1]的比较 



i=1  1<5
j=0  j<4 ++j
a[0] a[1]
a[1] a[2]
a[2] a[3]
a[3] a[4]



求某数（100~500）以内的10个最大素数及其和并分别输出。
**输入格式要求："%d"
**输出数据格式**："%6d"
                   "\n sum=%d\n"
程序的运行示例如下：
输入：500
输出： 499   491   487   479   467   463   461   457   449   443
 sum=4696
输入：199
输出：199   197   193   191   181   179   173   167   163   157
 sum=1800


#include<stdio.h>
int sushu(int t)
{
	int j;
	int shi=1;
	
	for(j=2;j*j<=t;j++)
	{
		if(t%j==0)
		  {
		   shi=0;
		  }
	}
	return shi;
}
int main(void)
{
    int t;
    int i;
    int sum=0;
    int a[10];
    
    scanf("%d",&t);
    
    for(i=0;i<10;t--)
    {
    	if(sushu(t))
    	{
		  a[i]=t;
    	  sum=sum+t;
    	  i++;
		}
    	
	}
	for(i=0;i<10;i++)
	{
		printf("%6d",a[i]);
		
	}
	printf("\n sum=%d\n",sum);
	return 0;
}


*/

/*
#include<stdio.h>
#include<malloc.h>
int main(void)
{
	int* arr;

	int n;
    int i;
	
	printf("Enter array size:");
	scanf("%d",&n);
	
	arr=(int*)malloc(n*sizeof(int));
	for(i=0;i<n;i++)
	{
		arr[i]=i*10;
		printf("array[%d]=%d\n",i,arr[i]);
		
	}
	free(arr);
	return 0;
	
}


*/
/*
#include<stdio.h>
int range_test( int val, int low, int high ) ;
int main(void)
{
	int val;
	int low,high;
	
	
	printf("请输入数值、下界和上界：\n");
	scanf("%d%d%d",&val,&low,&high);
	
	if(range_test(val,low,high))
	printf("函数测试输出为%d！\n",1);
	else
	printf("函数测试输出为%d！\n",0);
	
	
	return 0;
}

int range_test( int val, int low, int high ) 
{
	int t;
	
	if(val>=low&&val<=high)
	  t=1;
	else
	t=0;
	
	
	
	return t;
}



*/

/*
#include<stdio.h>
int yinshu(int num)
{
	int i=1;
	int j;
	int sum;
	
 for(j=0;j<num;j++)
	    {
	    	if(num%j==0)
	    	sum+=j;
		}	
	
	
return sum;	
}
int main(void)
{
	int n;
	int i,j;
	
	printf("Input n:\n");
	scanf("%d",&n);

	int sum1;

	
	 for(i=2;i<=n;i++)
	    {
	      sum1=yinshu(i);
	      
	      if(sum1>i&&sum1<=n){
	      	int sum1=yinshu(num1);
	      	
	      	if(sum1==i)
	      	{
	      	
    	printf("(%d,%d)\n",i,num1);
			  }
		  }
	      
	      
	      
	      
	      
	      
	      
	      
	      
    	}
	
	
	
	
	

    	printf("(%d,%d)\n",num1,num2);
	
	return 0;
}
*/
















































/*
#include<stdio.h>
struct Student
{
	int name;
	int old;
	float score;
	
};
int main(void)
{
	int num;
	int i;

	printf("请输入学生人数：");
	scanf("%d",&num);
	struct Student st[num];
	
	for(i=1;i<=num;i++)
	{
		
		
	    printf("请输入学生%d的:\n",i);
	    
	    printf("姓名：");
	    scanf("%d",st[i].name);
	    printf("年龄：");
	    scanf("%d",st[i].old);
	    printf("成绩：");
	    scanf("%f",st[i].score);
    }
	
	
	for(i=1;i<=num;i++)
	{
		printf("学生信息为：");
		
		printf("name=%d\n",st[i].name);
		printf("years=%d\n",st[i].old);
		printf("score=%f\n",st[i].score);
		


	}
	
	
	
	
	
	
	
	
	
	
	
	
	
	return 0;
}



*/

















/*
#include<stdio.h>
#include<stdlib.h>
#include<string.h>

typedef struct STUDENT
{
	char id[10];
	char name[9];
	int Cinese,Math,English;
	int zong;
	
	struct STUDENT *pNext;
	
}student;


void Input_student(student *p)
{
	scanf("%s",p->id);
	
	if(p->id[0]=='-') 
	   return ;
	   
	scanf("%s",p->name);
	scanf("%d%d%d",&p->Cinese,&p->Math,&p->English);
	p->zong=p->Cinese+p->Math+p->English; 
}
void link_student(student *pHead)
{
	student *pLast=NULL;
	
	for(pLast=pHead;pLast->pNext;pLast=pLast->pNext) ;
	
	while(1)
	{
		student * pNew=(student *)malloc(sizeof(student));
		Input_student(pNew);
		
		if(pNew->id[0]=='-') 
		{
			free(pNew);
			break;
		}
		else 
		{
			pLast->pNext=pNew;
			pNew->pNext=NULL;
			pLast=pNew;
		}
	}
}


void Sort_student(student *pHead)
{
	student *p1=NULL;
	student *p2=NULL;
	for(p1=pHead->pNext;p1->pNext;p1=p1->pNext)
	{
		for(p2=p1->pNext;p2;p2=p2->pNext)
		{
			if(p1->zong<p2->zong)
			{
				student t;
				t=*p1;
				memcpy(p1,p2,sizeof(student)-sizeof(student *));
				memcpy(p2,&t,sizeof(student)-sizeof(student *));
			}
		}
	}
}


void Show_student(student *pHead)
{
	student *p=NULL;// i
	for(p=pHead->pNext;p;p=p->pNext)
	{
		printf("%s%4d\n",p->name,p->zong);
	}
}

void free_student(student *pHead)
{
	student *p=NULL;
	student *pp=NULL;
	for(p=pHead;p;p=pp)
	{
		pp=p->pNext;
		free(p);
	}
}
int main(void)
{
    student *pHead=(student *)malloc(sizeof(student));
    pHead->pNext=NULL;
    
    link_student(pHead);
    printf("排序前：\n");
    Show_student(pHead);
    Sort_student(pHead);
    printf("排序后：\n");
    Show_student(pHead);
    free_student(pHead);
	return 0;
}
*/










/*


#include<stdio.h>
int main(void)
{
	FILE *fp=NULL;
	fp=fopen("C:\\Users\\fnw\\Desktop\\b.txt","w");
	if(fp=NULL)
	{
		printf("打开文件失败！！！");
		return 1;
	}
	
	
	int n;
	int i,j;
	scanf("%d",&n);
	for(i=0;i<n;i++)
	{
		for(j=0;j<i;j++)
		{
			printf("%4d",j);
			fprintf(fp,"%4d",j);
		}
		printf("\n");
		fprintf(fp,"\n");
	 } 
	
	fclose(fp);
	return 0;
 } 

*/
/*
#include<stdio.h>
#include<malloc.h>
void output(char* c)
{
	if(*c=='\0')
	return ;

		output(c+1);
		printf("%c",*c);
	
}
int main(void)
{
	char *c=(char*)malloc(100*sizeof(char));
	printf("input your string:\n");
	scanf("%s",c);
	
	output( c);
	
	return 0;
}

*/
/*
//实现从键盘输入一个字符串，将其字符顺序颠倒后重新存放，并输出这个字符串。
//（用字符数组实现）
#include <stdio.h>
#include <string.h>
void In(char* str);
 
int main()
{
    char str[80];
 
    printf("Input a string:\n");
    gets(str);
    In(str);
    printf("The inversed string is:\n");
    puts(str);
}
 
void In(char* str)
{
    int i,n;
    char temp;
 
    for(i=0, n=strlen(str)-1; i<n; i++, n--)
    {//n确定下标 
        temp = str[i];
        str[i] = str[n];
        str[n] = temp;
    }
}

*/
/*
求复数之积。利用结构变量求解如下两组复数之积。

za={3,4}, zb={5,6}

za={10,20}, zb={30,40}

**输出格式要求："(%d+%di)*(%d+%di)=" "(%d+%di)\n"
程序运行示例如下：
(3+4i)*(5+6i)=(-9+38i)
(10+20i)*(30+40i)=(-500+1000i)



#include<stdio.h>
struct z
{
	int a;
	int b;
};
int main(void)
{
	struct z za1={3,4
	};
	
	struct z zb1={5,6
	};
	
	struct z za2={10,20
	};
	struct z zb2={30,40
	};
	
	
	struct z z1={za1.a*zb1.a-za1.b*zb1.b,za1.b*zb1.a+zb1.b*za1.a
	};
	struct z z2={za2.a*zb2.a-za2.b*zb2.b,za2.b*zb2.a+zb2.b*za2.a
	};
	printf("(%d+%di)*(%d+%di)=" "(%d+%di)\n",za1.a,za1.b,zb1.a,zb1.b,z1.a,z1.b);
	
	printf("(%d+%di)*(%d+%di)=" "(%d+%di)\n",za2.a,za2.b,zb2.a,zb2.b,z2.a,z2.b);

	return 0;
}


#include<stdio.h>
struct date_rec
  {
    int day ;
    int month ;
    int year ;
  };


int test(struct date_rec date1,struct date_rec date2)
{
	if(date1.year>date2.year)
	return 1;
	else if(date1.year<date2.year)
	return -1;
	else if(date1.year==date2.year)
	{
		if(date1.month>date2.month)
		return 1;
		else if(date1.month<date2.month)
		return -1;
		else if(date1.month==date2.month)
		{
			if(date1.day>date2.day)
		      return 1;
	        else if(date1.day<date2.day)
		      return -1;
		      else if(date1.day==date2.day)
			  return 0;
			
			
		}
		
		
		
	}
}
int main(void)
{
	struct date_rec date1;
	struct date_rec date2;
	printf("请输入当前日期（年 月 日）：");
	printf("请输入当前日期（年 月 日）：");
	scanf("%d%d%d",&date1.year,&date1.month,&date1.day);
	scanf("%d%d%d",&date2.year,&date2.month,&date2.day);
	printf("当前日期：%d年%d月%d日！\n",date1.year,date1.month,date1.day);
	printf("当前日期：%d年%d月%d日！\n",date2.year,date2.month,date2.day);
	
	int i=test(date1,date2);
	
	if(i==0)
	printf("两个日期相同！");
	else if(i==-1)
	printf("第一个日期早于第二个日期！");
	else if(i==1)
	printf("第一个日期晚于第二个日期！");
	
	return 0;
}

*/

/*

写一个函数将以秒计数的时间转换为以时、分、秒计数的时间。
函数原型为：char *seconds_to(int seconds)。
编写main调用测试它。

**输入格式要求："%d" 提示信息："请输入时间（秒）：\n"
**输出格式要求："%d秒合计%s！\n"  "%d小时%d分钟%d秒"
*/
/*
#include<stdio.h>
#include<malloc.h>

char* seconds_to(int seconds)
{
	char* ko=(char*)malloc(100*sizeof(char));
  
	

	int hour=seconds/3600;
	int minus=(seconds%3600)/60;
	int sec=seconds%60;
	
   sprintf(ko,"%d小时%d分钟%d秒",hour,minus,sec);
   return ko;
	
}
int main(void)
{
	int sec;
    
	printf("请输入时间（秒）：\n");
	scanf("%d",&sec);
	
	int hour=sec/3600;
	int minus=(sec/60)%60;
	int seco=sec%60;
	
	char* c=seconds_to(sec);

	
	printf("%d秒合计%s！\n",sec,c);

	return 0;
	
	
	
}
*/
/*
#include<stdio.h>
Integral(float (*f)(float), float a, float b);
int main(void)
{
	float y1,y2;
	Integral(&y1,0,1);
	Integral(&y2,0,3);

	
	return 0;
}
Integral(float (*f)(float), float a, float b)
{
	int i=0;
	int t;
	float qujian=(b-a/100);
	for(i=0;i<100;i++)
	{
		t=
		
		
	}
	
	
	
	
	
}


*/
/*
#include<stdio.h>

struct date{
	int year;
	int month;
	int day;
	
};
int days(int y,int m,int d)
{
	int sum=0;
    int t;
    
   for(t=1;t<m;t++)
   {
     if(t==1||t==3||t==5||t==7||t==8||t==10||t==12)
	    sum+=31;
	 else if(t==2)
		{
		   	if(y%400==0||(y%100!=0&&y%4==0))
		   	  	sum+=29;
		   	else
		   	  	sum+=28;
		   	  	
		}
		else
		   	sum+=30;
    	}
    	
    	sum+=d;
    	
return sum;	
}
		

int main(void)
{
	struct date d1; 
	printf("请输入日期（年，月，日）\n");
	scanf("%d,%d,%d",&d1.year,&d1.month,&d1.day);
	
	int sum=days(d1.year,d1.month,d1.day);
	
	printf("\n%d月%d日是%d年的第%d天。",d1.month,d1.day,d1.year,sum);
	return 0;
}

*/

/*
编程统计候选人的得票数。设有3个候选人zhang、li、wang（候选人姓名不区分大小写），10个选民，选民每次输入一个得票的候选人的名字，若选民输错候选人姓名，则按废票处理。选民投票结束后程序自动显示各候选人的得票结果和废票信息。要求用结构体数组candidate表示3个候选人的姓名和得票结果。
例如：
Input vote 1:li
Input vote 2:li
Input vote 3:Zhang
Input vote 4:wang
Input vote 5:zhang
Input vote 6:Wang
Input vote 7:Zhang
Input vote 8:wan
Input vote 9:li
Input vote 10:lii
Election results:
      li:3
   zhang:3
    wang:2
Wrong election:2



输入格式：
"Input vote %d:"
"%s"
输出格式：
"Election results:\n"
候选人姓名+"%8s:%d\n"
"Wrong election:%d\n"
*/
/*
#include<stdio.h>
#include<string.h>
void to_lower(char *str) {
    int i = 0;
    while(str[i] != '\0') {
        // 如果是大写字母，转成小写（ASCII码：A-Z是65-90，a-z是97-122，差32）
        if(str[i] >= 'A' && str[i] <= 'Z') {
            str[i] += 32;
        }
        i++;
    }
}
//增加转大小写的函数 
struct candidate
{
	char ch[100];
	int sum;
};
int main(void)
{
	int i;
	char c[100];
	int wrong=0;
	
	struct candidate p1;
	struct candidate p2;
	struct candidate p3;
	strcpy(p1.ch,"zhang");
	strcpy(p2.ch,"li");
	strcpy(p3.ch,"wang");
	p1.sum=0;
	p2.sum=0;
	p3.sum=0;
	 
	for(i=1;i<=10;i++)
    {
    
		printf("Input vote %d:",i);
	    scanf("%s",c);
	    to_lower(c);
	    if(strcmp(c,p1.ch)==0)
	    {
		p1.sum+=1;
     	}
	    else if(strcmp(c,p2.ch)==0)
	    {
		p2.sum+=1;
	}
	    else if(strcmp(c,p3.ch)==0)
	    {

		p3.sum+=1;
	}
	    else
	    wrong+=1;
	
    }
	struct candidate t={"ok",0
	};
//以下为排序 
	if(p1.sum<p2.sum)
	{
	t=p1;
	p1=p2;
	p2=t;
}
	if(p1.sum<p3.sum)
	{
		t=p1;
		p1=p3;
		p3=t;
	 } 
	 if(p2.sum<p3.sum)
	 {
	 	t=p2;
	 	p2=p3;
	 	p3=t;
	 }
	 //排序结束
	 
	  
    printf("Election results:\n");
    printf("%8s:%d\n",p2.ch,p2.sum);
    printf("%8s:%d\n",p1.ch,p1.sum);
    printf("%8s:%d\n",p3.ch,p3.sum);
    printf("Wrong election:%d\n",wrong);
	
	return 0;
}

*/
/*
#include<stdio.h>
#include<malloc.h>
#include<string.h>

char* coy(char co[100])
{
	char ao[100];
	strcpy(ao[100],co[100]);
	
	return &ao[100];
	
}
int main(void)
{
	char*c=(char*)malloc(200*sizeof(char));
	
	printf("Enter String:");
	scanf("%s",c);
	char * coy=coy(c);
	
	printf("a=%s\nb=%s\n",c,*coy);
	return 0;
 } 



*/
/*
#include<stdio.h>
struct time_rec
{
    int hours ;
    int mins  ;
    int secs  ;
} ;
void input_time(struct time_rec *current_time)
{
	printf("请输入当前时间（时 分 秒）：");
	
	scanf("%d%d%d",&current_time->hours,&current_time->mins,&current_time->secs);
}
void increment_time(struct time_rec *current_time)
{
	current_time->secs+=1;
}
void output_time(struct time_rec *current_time)
{
	printf("当前时间：%d时%d分%d秒！",current_time->hours,current_time->mins,current_time->secs);
	
}
int main(void)
{
	struct time_rec current_time ; 
	
	input_time(&current_time);
	increment_time(&current_time);
	output_time(&current_time);
	return 0;
}

*/

/*
#include<stdio.h>
int  sushu(int i)//发现要返回sum，所以把void改为了int 
{
	int j;
	int sum=0;
	if(i==1)
	  sum=1;
	else if(i==2)
	sum=0;
	else
	{
		for(j=2;j<i;j++)
		{
			if(i%j==0)
			  sum=sum+1;
			
		}
	}
	return sum;
}
int main(void)
{
	int sum;//需要重新定义sum。然后上面sushu（）的值要赋值给sum才行 
	int i;
	printf("请输入一个数字！\n");
	scanf("%d",&i);
	sum=sushu(i);
	if(sum==0)
	printf("Yes!\n");
	else
	printf("No!\n");
	
	
	return 0;
 } 


*/
/*
#include<stdio.h>
bool IsPrime(int tem)
{
	int i;
	for(i=2;i<tem;i++)
	{
		if(tem%i==0)
		break;	
	}
	
	if(i==tem)
	return true;
	else
	return false;
	
}
int main(void)
{
	int n;
	
	printf("请输入您想要判断的数字！\n");
	scanf("%d",&n);
	int t=IsPrime(n);
	if(t)
	printf("您输入的是个素数！\n");
	else
	printf("您输入的不是个素数！\n");

	return 0;
}
*/
/*
//求1到某个数字之间所有的素数，并且输出 
#include<stdio.h>
bool IsPrime(int tem)
{
	int i;
	for(i=2;i<tem;i++)
	{
		if(tem%i==0)
		break;
	}
	
	if(tem==i)
	return true;
	else
	return false;
}
int main(void)
{
	int num;
	int i;
	scanf("%d",&num);
	for(i=1;i<=num;i++)
	{
		if(IsPrime(i))
		printf("%d\n",i);
	}
	return 0;
}


*/
/*
#include<stdio.h>
#include<malloc.h>
int main(void)
{
	int n;
	scanf("%d",&n);

	char* c=(char*)malloc(n*sizeof(char));
	printf("请输入字符串！\n");
	gets(c);
	printf("%s",c);
	return 0;
}

*/
/*
#include<stdio.h>
int main(void)
{
	char c[100];
	printf("Input:\n");
	gets(c);
	int len=0;
	int i;
	for(i=0;*c[i];i++)
	{
		len+=1;
	}
	return 0;
}
*/

/*
#include<stdio.h>
float hanshu(int* num)
{
	float guo=0;
	int i=0;
	
	if(*num%2==0)
	{
		for(i=1;i<=(*num/2);i++)
		{
			guo+=1.0/(i*2);
		}
		printf("Even=%f",guo);
	}
	else
	{
		for(i=1;(2*i)-1<=*num;i++)
		{
			guo+=1.0/((i*2)-1);
		}
		printf("Odd=%f",guo);		
	}
	return guo;
}
int main(void)
{
	int n;
	
	scanf("%d",&n);
    hanshu(&n);
	
	return 0;
}

*/
/*
n=9 
hanshu（）
i=1，1<9,guo= 

*/
/*

用一个整型数组feedback保存调查的20个反馈意见，
其中反馈意见是1-10范围中的一个整数。
用函数编程计算反馈意见的众数。
众数是数组中出现次数最多的那个数。
（假设不会发生两个或两个以上的反馈意见出现次数相同的情况）
要求：
（1）任意从键盘输入20个值在1-10范围中的整数，
     编写函数Mode，求众数，
     主函数调用函数Mode，并输出众数。
（2）计算n个数的众数的函数原型：
      int Mode(int answer[], int n) 
（3）**输入提示信息格式要求："Input 20 feedbacks:\n"
     **输入格式要求："%d"
     **输出格式要求："Mode value=%d\n"
（4）不要使用结构体

*/
/*
#include<stdio.h>
int Mode(int answer[], int n)
{
	int i,j;
	int cishu=0;
	int t;
	int maxt=0;
	int modeVale;
	
	for(i=0;i<n;i++)
	{
		cishu=0;
		for(j=0;j<n;j++)
		{
			if(answer[i]==answer[j])
			{
				cishu+=1;//jishu+= 不对 
	    	}
		}
		 if(cishu> maxt)
        {
            maxt = cishu;
            modeVale = answer[i];
        }
		
	}
   
	return modeVale;
}
int main(void)
{
	int feedback[20];
	int i;
	int jieguo;
	
	printf("Input 20 feedbacks:\n");
	for(i=0;i<20;i++)
	{
		scanf("%d",&feedback[i]);
	}
	jieguo=Mode(feedback,20);
	printf("Mode value=%d\n",jieguo);
	return 0;
}

*/











































































































































