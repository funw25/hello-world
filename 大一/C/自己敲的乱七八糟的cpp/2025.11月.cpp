/*
c语言中，main函数标准定义应为int main（void ）    无参数
 或者 int main(int argc,char *argv[])             有参数，用于命令行参数
 
 注意不要用中文字符；；
 会识别不出来报错
 
 main函数内的语句需要包含在大括号{}中 


*/

/*

#include<stdio.h>
int main(void)
{
	printf("%d",sizeof(char));//1
	printf("%d",sizeof(short));//2
	printf("%d",sizeof(int));//4
	printf("%d",sizeof(long));//4
	printf("%d",sizeof(float));//4
	printf("%d",sizeof(double));//8
	//单位是字节，一个long占了四个字节 
	
	return 0;
}



/*计算机中单位梳理
最小的：bit   比特位
        byte   字节
		kb
		mb
		gb
		tb
		pb 

计算机理解的是二进制，而我们人类生活在十进制的世界
10100011110 （二进制只有0和1）               123456789（十进制世界有0123456789）


现在二进制中要存储一个0（或者1）
存储这个0所需要的空间大小叫做一个比特位
八个连续的比特位合起来叫一个字节
即：1个byte=8个bit
    1kb=1024 byte
    1mb=1024 kb
    1gb = 1024 mb
    1tb = 1024 gb
    1pb = 1024 tb
 
 
 
 
 类型的使用

想表示一个人20岁
需要内存给一个空间放“20”

int age =20;

表示向内存申请了int 大小的空间，命名为age，存储了 20     

变量与常量：


*/

// 2025.11.1
/*#include<stdio.h>
int main(void)
{
	int price=0;
	printf("请输入金额（元）");
	scanf("%d",&price);
	printf("找您%d元",100-price);;
	
	return 0;
}


*/

/*
#include<stdio.h>
int main(void)
{
	int i;
	printf("i=%d\n",i);
	
	return 0;
}

*/
/*
#include<stdio.h>
int main(void)
{
	float x=3.2e3F;
	printf("%f",x);
	return 0;
}


*/
/*
#include<stdio.h>
int main(void)
{
	int i=2134;
	int j=12;
	printf("%#x %#x\n",i,j);
	
	
	return 0;
}


*/

/*
#include<stdio.h>
int main(void)
{
	int i=33;
	printf("%d",i);
	printf("学得我想死"); 
	
	return 0;
}

*/
//scanf的用法1

/* 
#include<stdio.h>
int main(void)
{
	int i;
	scanf("%d",&i);
	printf("%d",i);
	
	
	return 0;
}



*/

/*
#include<stdio.h>
int main(void)
{
    int a,b;
    printf("Input a, b:");
    scanf("%d %d",&a,&b);
    
    int k;
    k=(a>b)?a:b;
    printf("max = %d\n",k);
    
    
    return 0;
}


*/

/*
错得很离谱，需要do while 循环 
#include<stdio.h>
int main(void)
{
    float F=0.0;
    float x;
    x=5.0/9*(F-32);
    printf("%4.0f%10.1f\n",F,x);
    if(F<300){
        F++;
        x=5.0/9*(F-32);
    printf("%4.0f%10.1f\n",F,x);
    }
    else{
        printf("%4.0f%10.1f\n",F,x);
    }
}

*/


/*
来自g老师 
#include <stdio.h>

int main(void)
{
    float F, x;
    F = 0.0;

    printf("Fahrenheit   Celsius\n");

    while (F <= 300) {
        x = 5.0 / 9 * (F - 32);
        printf("%4.0f%10.1f\n", F, x);
        F = F + 20;   // 每隔20度打印一次
    }

    return 0;
}



*/



//清除用户的非法输入残留 

/*
#include<stdio.h>
int main(void)
{
	int i;
	char ch;
	
	scanf("%d",i);
	printf("i=%d\n",i);
	
	while((ch=getchar())!='\n')
	      continue;
	int j;
    scanf("%d",&j);
	printf("j=%d\n",j);
	
	
	return 0;
}
	
	
	
*/

/*
#include<stdio.h>
int main(void)
{
	printf("13%2\n");
	printf("-13%23");
	
	return 0;
}

*/

/*
#include<stdio.h>
int main(void)
{
	
	
	
	
	int i=10;
	int k=20;
	int m;
	
	m=(3>2)&&(k=8);        //真&&假  ？ 
	printf("m=%d,k=%d\n",m,k);
	
	
	
	return 0;
}

//m=1，k=8 


*/
/*
#include<stdio.h>
int main(void)
{
	
	
	
	
	int i=10;
	int k=20;
	int m;
	
	m=(3>2)||(k=8);        //真&&假  ？ 
	printf("m=%d,k=%d\n",m,k);
	
	
	
	return 0;
}


*/
/*

#include<stdio.h>
int main(void)
{
	int i=10;
	int k=20;
	int m;
	
	m=(3>2)&&(k=8);
	printf("m=%d,k=%d\n",m,k);
	
	return 0;
}




#include<stdio.h>
int main(void)
{
	int i=10;
	int k=20;
	int m;
	
	m=(3>2)&&(k=0);//真&&假（k=0）     但前面定义了k=20，所以语句为假，对应为假 
	printf("m=%d,k=%d\n",m,k);
	
	return 0;
}



*/


/*
#include<stdio.h>
int main(void)
{
	int i;
	
	scanf("%d\n",&i);
	printf("i=%d\n",i);
	
	
	
	
	return 0;
}




*/


//if 最简单的用法
//if 的范围问题/ 

/*

#include<stdio.h>
int main()
{
	if (3>2)
	{   
	
	    printf("AAAA\n"); 
	
    }
	
	
	
	
	return 0;
 } 


*/
/*


#include<stdio.h>
int main(void)
{
	if(2>3)
	{
		printf("！！！");
		printf("guanyu"); 
	}
	else
	{
		printf("qqq");
	}
	
	
	
	return 0;
}

*/

/*
#include<stdio.h>
int main(void)
{
	double a=3;
	if(a==2)
	  printf("该方程有两个解");
	  printf("hello");
	else if(a==1)
	  printf("该方程有一个解");
	else
	  printf("该方程无解");
	
	
	return 0;
}




*/

//分数的等级划分
/*#include<stdio.h>
int main(void)
{
	//用户输入了分数？然后呢，要保存,注意用float 
	float score;
	
	printf("请输入您的考试成绩");
	scanf("%f",&score);
	
	if (score>100)
	   printf("做梦~\n");
	else if (score>=90&&score<=100)//不能像下面那个程序那样写
	   printf("优秀！\n"); 
    else if (score>=80&&score<=90)//else if 后面不能+分号；  否则这个if语句就认为结束了，后面的就没有if了 
       printf("良好\n");
    else
       printf("及格");
	
	
	
	return 0;
 } 

*/
/*
#include<stdio.h>
int main(void)
{
	int score;
	
	scanf("%d",&score);
	int i=90<=score<=100;
	
	printf("%d",i);
	
	return 0;
}

//这个代码的输出值永远为1 
*/
/*
#include<stdio.h>
int main(void)
{
	int i=3;
	int j=4;
	
	i=j;//此时j赋给了i，i=4 
	j=i;
	
	printf("i=%d,j=%d\n",i,j);
	
	
	return 0;
}

*/

//想要呼互换数字，需要一个新的容器（变量） 
/*
#include<stdio.h>
int main(void)
{
	
	int i=3;
	int j=5;
	int k;
	
	k=i;
	i=j;
	j=k;
	
	printf("%d %d",i,j);
	
	return 0;
}

*/
//对任意三个数字进行排序
//涉及到解题思路了：程序=算法＋语言 
 //以下为我的代码 
 
 
 
 /*
#include<stdio.h>
int main(void)
{
	int a,b,c;
	
	printf("请输入三个数字（中间以空格分割）：");
	scanf("%d %d %d",&a,&b,&c);
	
	//编写代码完成：a是最大值，b是中间值，c是最小值
	
	int t,j;
	if (b>=a)
	   {
	   	t=a;
	    a=b;
	    b=t;
	   }
    if(c>=a)
	  {
	   j=a;
	   a=c;
       c=j;
	  	
	   }
	
	if (c>=b)
	 {
	   t=c;
	   c=b;
	   b=t;
	   } 
	
	printf("%d %d %d",a,b,c); 
	
	
	return 0;
}

//错误：1.if的范围问题，要带{}
//      2. 每次；总是用中文打，就会报错
//      3.如果用if else，出现条件判断再执行，改为if的简单语句 

*/
//以下为老师的代码
/*
#include<stdio.h>
int main(void)
{
	int a,b,c,t;
	scanf("%d %d %d",&a,&b,&c);
	
	
	if (a<b)
	   t=a;
	   a=b;
	   b=t;
	if(a<c)
	   t=a;
	   a=c;
	   c=t;
	if(b<c)
	   t=b;
	   b=c;
	   c=t;
	
	printf("%d %d %d",a,b,c);
	return 0;
 } 

*/

//if常见问题 
/*
#include<stdio.h>
int main(void)
{
	if(3>2)
	  printf("AAA");
	
	
	
	
	return 0;
 } 

*/

/*

#include<stdio.h>
int main(void)
{
	int i;
	int sum=0;
	
	
	for(i=1;i<=4;++i)
	    sum=sum+i;
	printf("sum=%d\n",sum);
	
	
	
	return 0;
}

*/
//求1~100之间能背3整除的数字之和 


/*
#include<stdio.h>
int main(void)
{
	int i;
	int sum=0;
	for(i=1;i<=100;++i)
	{
		if(i%3==0)
		    sum=sum+i;
		   	printf("sum=%d\n",sum);
            
	}
	

	
	
	
	return 0;
}




#include<stdio.h>
int main(void)
{
	int i;
	int sum=0;
	for(i=1;i<=100;++i)
	{
		if(i%3==0)
		    printf("sum=%d\n",sum);
		   	sum=sum+i;
            
	}
	
	return 0;
}

*/
//求1+1/2+1/3+1/4+……
 
 
/* 下面这个程序是错的!!!! 
#include<stdio.h>
int main(void)
{
	int i;
	int sum=0;
	
	for(i=1;i<=100;++1)
	{
		sum=sum+1/i;//此处，被除数和除数都是整数，则输出结果为整数。有一个是小数，则输出结果含小数位——所以sum要定义为浮点型 
	}
	
	printf("sum=%d\n",sum);
	
	
	return 0;
}
*/
//求1~100之间奇数和


/*
 
#include<stdio.h>
int main(void)
{
	int i;
	int sum=0;
	
	for(i<=1;i<101;++i)
	{
		if(i%2==1)//(i为奇数） 
		sum+=i;//sum=sum+1
	}
	
	
	printf("sum=%d\n",sum);
	return 0;
}


*/
/*
//求 1~100之间奇数的个数 
#include<stdio.h>
int main(void)
{
	int i;
	int cnt=0;//一般个数用cnt表示！！ 
	
	for(i=1;i<101;++i)
	{
		if(i%2==1)
		++cnt;
	}
	printf("%d",cnt);
	
	return 0;
}


*/
/*
求1~100之间的奇数的平均值

错误： 
#include<stdio.h>
int main(void)
{
	int i;
	int sum=0;
	int cnt =0;
	for(i=1;i<101;++i)
	{
		if(i%2==1)
		sum+=1;
		++cnt;//即使if不成立，这个句子也会执行，要＋{}才对 
		//不要感觉这个程序对就对了，要真的去试数 
	}
	
	printf("sum=%d\n",sum);
	printf("cnt=%d\n",cnt);
	
	return 0;
}

正确：


#include<stdio.h>
int main(void)
{
	int i;
	int sum=0;
	int cnt =0;
	float avg;//average的缩写 
	
	
	for(i=1;i<101;++i)
	{
		if(i%2==1)
		{
			sum+=i;
		    ++cnt;
		}
	}
	
	avg=1.0*sum/cnt;   //1.0默认为double型 
	printf("sum=%d\n",sum);
	printf("cnt=%d\n",cnt);
	printf("avg=%f\n",avg);
	return 0;
}
*/ 
//求奇数和 偶数和 

/*
#include<stdio.h>
int main(void)
{
	int i;
	int sum1=0;
	int sum2=0;
	int cnt =0;
	float avg;//average的缩写 
	
	
	for(i=1;i<101;++i)
	{
		if(i%2==1)
		{
			sum1 +=i;
		    ++cnt;
		}
		else
		{
			sum2 +=i;
		}
	}
	
	avg=1.0*sum/cnt;   //1.0默认为double型 
	
	printf("奇数和=%d\n",sum1);
	printf("偶数和=%d\n",sum2);
	printf("cnt=%d\n",cnt);
	printf("avg=%f\n",avg);
	
	return 0;
}

什么玩意，困死我了 
#include<stdio.h>
int main(void)
{
	int i=0;

	++i;
	printf("%d",i);
	printf("%d",++i);
	printf("%d",i++);
	
	return 0;
}


//自增自减运算符学习

 
#include<stdio.h>
int main(void)
{
	int i;
	int j;
	int k;
	int m;
	
	i=j=3;
	k=i++;
	m=++j;
	
	printf("i=%d,j=%d,k=%d,m=%d\n",i,j,k,m); 
	
	
	
	
	return 0;
}


i++和++i最好单独成一个语句，
如：
int m=i++ + ++i + i + i++                 //这样写不但不规范，而且不可移植 
printf（“%d %d %d”，i++，++i，i）；     //这个也是，同上 
*/

//关于三目运算符
/*A?B:c
等价于：
     if(A)
	   B;
	 else
	   C; 


#include<stdio.h>
int main(void)
{
	int i;
	
	i=(2>3?5:1);
	printf("%d\n",i);
	
	return 0;
}
*/

//关于逗号表达式
/*
#include<stdio.h>
int main(void)
{
	int i;
	i=(1,2,3,4);
	
	printf("%d",i);
	
	return 0;
}
 

#include<stdio.h>
int main(void)
{
	int i;
	int j=2;
	
	i=(j++,++j,j+2,j-3);//“，”叫做顺序点，之前的东西必须在下个语句前生效 
	printf("%d\n",i);
	
	return 0;
}

//j++ 使j的值变为3
//++j使j的值变为4
但是j+2没有使j的值改变，没有把j+2的值赋给j！！！！ 

所以，如果i+2  i的值不会改变。
除非写成i=i+2或者i+=2

i+2只是产生了一个临时值，这个值=i+2

而这道题，按照逗号表达式，最终输出为最后一个位置的值，也就使j-3
此时j=4，j-3得1 

 
*/

/*
//for循环嵌套举例子
#include<stdio.h>
int main(void)
{
	int i,j;
	
	for(i=0;i<3;++i);
	    for(j=2;j<5;++j)
	       printf("哈哈！\n");
	       
	    printf("xx\n");
	
	
	return 0;
 } 

*/
//while的学习
//求出1~100的和
//以下为我的程序
/*
#include<stdio.h>
int main(void)
{
	int sum=0;
	int i=1;
	
	while(i<101)
	     {sum+=i;
	      i+=1;
	     
		 }
	
	printf("%d\n",sum);
	
	
	
	return 0;
}

*/

//用for来写一下 
/*
#include<stdio.h>
int main(void)
{
	int i;
	int sum=0;
	

 //   i=0;
    while(i<101)
    {
    	sum=sum+i;
    	++i
	}
	
//	printf("%d",sum);
	
	return 0;
}
*/


/*	for(i=1;i<101;++i)
	   {
	   	sum+=i;
	   	
	   }
*/
/*
//写一个程序，判断回文数

#include<stdio.h> 
int main(void)
{
	int val;//val来存放待判断的数字 
	int m;
	int sum=0;
	
	printf("请输入您需要判断的数字：")； 
	scanf("%d",&val);
	
	m=val;
	while(m)  //只要m不为0，（哪怕是个负数，都成立，向下执行{}里的句子） 
	{
		sum=sum*10+m%10;
		m/=10;
	}
	if(sum==val)
	   printf("Yse!\n");
	else
	   printf("No!\n")； 
	
	
	return 0;
}

*/

/*
#include<stdio.h>
int main(void)
{
	int n;
	int f1,f2,f3;
	int i;
	
	f1=1;
	f2=2;
	
	printf("请输入您需要求的项的序列数：\n");
	scanf("%d",&n);
	
	if(1==n)
	{
		f3=1;
	}
	else if(2==n)
	{
		f3=2;
	}
	else
	{
		for(i=3;i<=n;++i)
		{
			f3=f1+f2;
			f1=f2;
			f2=f3;
		}
			
	}
	
	printf("%d\n",f3);
	
	return 0;
}


*/

/*求方程有几个解 

我的代码：修正过后如下 
#include<stdio.h>
int main(void)
{
	double a,b,c;
	double delta;
	double x1,x2;
	
	printf("请输入一元二次方程的三个系数：\n");
	printf("a=\nb=\nc=\n");
	scanf("%lf %lf %lf",&a,&b,&c);
	
	delta=b*b-4*a*c;
	
	if(delta>0)
	{
		printf("这个方程有两个解。\n");
	}
	else if (delta==0)
	{
		printf("这个方程有两个相同的解/有一个解。\n");
	}
	else
	{
		printf("这个方程无解。\n");
	}
	
	
	return 0;
}


*/

/*
#include<stdio.h>
#include<math.h>
int main(void)
{
	double a,b,c;
	double delta;
	double x1,x2;
	
	printf("请输入一元二次方程的三个系数：");
	printf("a=");
	scanf("%lf",&a);
	
	printf("b=");
	scanf("%lf",&b);
	
	printf("c=");
	scanf("%lf",&c);
	
	delta=b*b-4*a*c;
	
	if(delta>0)
	{
		x1=(-b+sqrt(delta))/(2*a);
		x2=(-b+sqrt(delta))/(2*a);
		printf("有两个解，x1=%lf,x2=%lf\n",x1,x2);
	}
	else if(0==delta)
	{
		x1=x2=(-b)/(2*a);
		printf("有唯一的解，x1=x2=%f\n",x1,x2);	
	}
	else
	{
		printf("无实数解！\n");
	}
	
	
	return 0;
}

//1：头文件math.h
//2.打快了很多错误，比如（）少了一边    ；少了   ；打在（）里面    main拼错
//定义为double，输出参数应该为   %lf！！！！！！！ 

//想求多个值，do  while

 */
 
 /*
#include<stdio.h>
#include<math.h>
int main(void)
{
	double a,b,c;
	double delta;
	double x1,x2;
	
	do
	{
	printf("请输入一元二次方程的三个系数：");
	printf("a=");
	scanf("%lf",&a);
	
	printf("b=");
	scanf("%lf",&b);
	
	printf("c=");
	scanf("%lf",&c);
	
	delta=b*b-4*a*c;
	
	if(delta>0)
	{
		x1=(-b+sqrt(delta))/(2*a);
		x2=(-b+sqrt(delta))/(2*a);
		printf("有两个解，x1=%lf,x2=%lf\n",x1,x2);
	}
	else if(0==delta)
	{
		x1=x2=(-b)/(2*a);
		printf("有唯一的解，x1=x2=%f\n",x1,x2);	
	}
	else
	{
		printf("无实数解！\n");
	}
    }  while(1) ;
	
	return 0;
}

//纠错：do   while（表达式）；
//表达式完了有个分号！！！！！！！！！！！！！！！ 
//什么时候终止呢？？ 
*/
/*
#include<stdio.h>
#include<math.h>
int main(void)
{
	double a,b,c;
	double delta;
	double x1,x2;
	char ch;
	
	do
	{
	printf("请输入一元二次方程的三个系数：");
	printf("a=");
	scanf("%lf",&a);
	
	printf("b=");
	scanf("%lf",&b);
	
	printf("c=");
	scanf("%lf",&c);
	
	delta=b*b-4*a*c;
	
	if(delta>0)
	{
		x1=(-b+sqrt(delta))/(2*a);
		x2=(-b+sqrt(delta))/(2*a);
		printf("有两个解，x1=%lf,x2=%lf\n",x1,x2);
	}
	else if(0==delta)
	{
		x1=x2=(-b)/(2*a);
		printf("有唯一的解，x1=x2=%lf\n",x1,x2);	
	}
	else
	{
		printf("无实数解！\n");
	}
	
	   printf("您想继续吗？（Y/N）：");
	   scanf(" %c",&ch);  //%前面必须要有一个空格（原因太复杂，没讲） 
    }  while('y'==ch||'Y'==ch) ;
	
	return 0;
}

//''中只能有一个字符，“yes”是三个字符，报错 

*/


//switch示例 

/*
#include<stdio.h>
int main(void)
{
	int val;
	
	printf("请输入您要进入的楼层：");
	scanf("%d",&val);//val是用户输入的数据 
	
	switch(val)
	{
		case 1:    //val和1相等，执行这个下面的printf和break语句 
			printf("1层开！\n");
			break;
		case 2:  //和2相等，执行下面两个 
			printf("2层开！\n");
			break;
		case 3:
			printf("3层开！\n");
			break;
		default://和123都不等，执行下面两个 
			printf("没有盖到这一层！\n");
			break;
	}
	return 0;
}


*/

//break的作用
/*
 
#include<stdio.h>
int main(void)
{
	int val;
	
	printf("请输入您要进入的楼层：");
	scanf("%d",&val);
	
	switch(val)
	{
		case 1:    
			printf("1层开！\n");
			//break;             当break被去掉，输入1，执行了case1到case2 
		case 2:  
			printf("2层开！\n");
			break;
		case 3:
			printf("3层开！\n");
			break;
		default:
			printf("没有盖到这一层！\n");
			break;
	}
	return 0;
}
//case1  case2 case3 和default是程序的入口
/*
val判断值和下面哪个相等，
要么从1入，要么从2入，要么从3入，123都不，就入default
一旦找到程序的入口，就没有123和default了，程序从上往下连续执行 

*/
/*
#include<stdio.h>
int main(void)
{
	int i;
	
	for(i=0;i<3;++i)
	{
		if(3>2)
		  {
		    break;
		    printf("hey.\n");
		  }
		
	}
	
	return 0;
}

*/
/*
#include<stdio.h>
int main(void)
{
	int x=1,y=0,a=0,b=0;
	switch(x)//第一个switch
	{
		case 1:
			switch(y)//第二个switch
			{
				case 0:
					a++;
					break;//终止的是第二个switch
				case 1:
				    b++;
					break; 
			 } 
			 b=100;
			 break;
		case 2:
			a++;
			b++;
			break;
	 } 
	
	printf("%d %d\n",a,b);
	
	return 0;
}
//最终输出结果是1 100

 */
 //学习continue
  


//学习数组

/*初试 
#include<stdio.h>
int main(void) 
{
	int a[5]={1,2,3,4,5};
	//a是数组的名字，5是数组元素个数，
	int i;
	for(i=0;i<5;i++)
	   printf("%d",a[i]) ;
	
	
	return 0;
}

*/

//学习一维数组









/*
#include<stdio.h>
int main(void)
{
	char ch=getchar();
	printf("%c",ch);
	
	
	return 0;
 } 


*/


/*

#include<stdio.h>
int main(void)
{
	char ch;
	
	scanf("%c",&ch);
	printf("%c",ch);
	
	
	return 0;
 } 

*/



/*

#include<stdio.h>
int main(void)
{
	char ch='B';
	

	printf("%c",ch);
	
	
	return 0;
 } 

*/
/*
#include<stdio.h>
int main(void)
{
	int n=5;
	int i,j;
	
	for(i=1;i<=n;i++)
	   {
	   for(j=1;j<=i;j++)
	       printf("*");
	       
	       printf("\n");
        } 
	
	return 0;
}
*/

//图形输出; 
/*
#include<stdio.h>
int main(void)
{
    int n,i,j,k,a;
    scanf("%d",&n);

    for(i=1;i<=n;i++)
    {
        for(j=(n-i);j>=1;j--)
        {
            printf(" ");
        }
        for(k=1;k<=(2*i-1);k++)
        {
            printf("*");
        }
        printf("\n");
    }
    for(i=n-1;i>=1;i--)
    {
        for(j=(n-i);j>=1;j--)
        {
            printf(" ");
        }
        for(k=1;k<=(2*i-1);k++)
        {
            printf("*");
        }
        printf("\n");
    }
    return 0;
}






*/

/*
#include<stdio.h>
int main(void)
{
    int sum=0;
    int i;
    
    for(i=1;i<101;i++)
        {
            if(i%7==0&&i%3!=0&&i%2==0)
              {printf("%5d",i);
              sum+=i;
              }
        }
    printf("\nsum=%d\n",sum);
    
    return 0;
}

*/

/*
#include<stdio.h>
int main(void)
{
	int a[10];
	int max;
	int i;
	
	scanf("%d",&a[0]);
	scanf("%d",&a[1]);
	scanf("%d",&a[2]);
	scanf("%d",&a[3]);
	scanf("%d",&a[4]);
	scanf("%d",&a[5]);
	scanf("%d",&a[6]);
	scanf("%d",&a[7]);
	scanf("%d",&a[8]);
	scanf("%d",&a[9]);
	
	max=a[0];
	
	for(i=0;i<10;i++)
	{
		if(max<a[i])
		  max=a[i];
	}
	printf("max=%d\n",max);
	return 0;
}



*/

/*
身高预测。
每个做父母的都关心自己孩子成人后的身高，据有关生理卫生知识与数理统计分析表明，影响小孩成人后的身高的因素包括遗传、饮食习惯与体育锻炼等。小孩成人后的身高与其父母的身高和自身的性别密切相关。
设faHeight为其父身高，moHeight为其母身高，为float类型，身高预测公式为
男性成人时身高 = (faHeight + moHeight) × 0.54 cm
女性成人时身高 = (faHeight × 0.923 + moHeight) / 2 cm
此外，如果喜爱体育锻炼，那么可增加身高2%；如果有良好的卫生饮食习惯，那么可增加身高1.5%。
请编程从键盘输入用户的性别（用字符型变量sex存储，输入字符F表示女性，输入字符M表示男性）、父母身高（用实型变量存储，faHeight为其父身高，moHeight为其母身高）、是否喜爱体育锻炼（用字符型变量sports存储，输入字符Y表示喜爱，输入字符N表示不喜爱）、是否有良好的饮食习惯等条件（用字符型变量diet存储，输入字符Y表示良好，输入字符N表示不好），利用给定公式和身高预测方法对身高进行预测。
运行示例：
Are you a boy(M) or a girl(F)?F↙
Please input your father's height(cm):182↙
Please input your mother's height(cm):162↙
Do you like sports(Y/N)?N↙
Do you have a good habit of diet(Y/N)?Y↙
Your future height will be 167(cm)
*/

/*
#include<stdio.h>
int main(void)
{
	char sex;
	float faHeight,moHeight;
	char sports,diet;
	float h;
	
	printf("Are you a boy(M) or a girl(F)?");
	scanf("%c",&sex);
	printf("\n");
	printf("Please input your father's height(cm):");
	scanf("%f",&faHeight);
	printf("\n");
	printf("Please input your mother's height(cm):");
	scanf("%f",&moHeight);
	printf("\n");
	printf("Do you like sports(Y/N)?");
	scanf("%c",&sports);
	printf("\n");
	printf("Do you have a good habit of diet(Y/N)?"); 
	scanf("%c",&diet);
	printf("\n");
	
	
	if(sex==M)
	  h=(faHeight+moHeight)*0.54;
	else
	  h=(faHeight*0.923+moHeight)/2.0;
	  
	if(sports==y)
	  h=h*(1+2.0/100);
	  
	if(diet==y)
	 h=h*(1+1.5/100);
	 
	printf("Your future height will be %f(cm)",&h);
	
	return 0;
}




#include<stdio.h>
int main(void)
{
	char sex;
	float faHeight,moHeight;
	char sports,diet;
	float h=0;
	
	printf("Are you a boy(M) or a girl(F)?");
	scanf("%c",&sex);
	printf("\n");
	printf("Please input your father's height(cm):");
	scanf("%f",&faHeight);
	printf("\n");
	printf("Please input your mother's height(cm):");
	scanf("%f",&moHeight);
	printf("\n");
	printf("Do you like sports(Y/N)?");
	scanf("%c",&sports);
	printf("\n");
	printf("Do you have a good habit of diet(Y/N)?"); 
	scanf("%c",&diet);
	printf("\n");
	
	
	if(sex=='M')
	  h=(faHeight+moHeight)*0.54;
	else
	  h=(faHeight*0.923+moHeight)/2.0;
	  
	if(sports=='y')
	  h=h*(1+2.0/100);
	  
	if(diet=='y')
	 h=h*(1+1.5/100);
	 
	printf("Your future height will be %f(cm)");
	
	return 0;
}


*/

/*
#include<stdio.h>
int main(void)
{
    char ch;
      
    scanf("%c",&ch);
    if(ch>='A'&&ch<='Z'||ch>='a'&&ch<='z')
      printf("It is an English character.\n");
    else if(ch>='0'&&ch<='9')
      printf("It is a digit character.\n");
    else 
      printf("It is other character.\n");
    return 0;
}


*/

/*
#include<stdio.h>
int main(void)
{
	int h,m;
	int h1;
	int h2;
	int h3;
	
	
	printf("请输入爱尔兰当地时间（24小时制，如22：35）: ");
	scanf("%d:%d",&h,&m);
	
	h1=h-5;
	
	if(h1<0)
	  {
	  h1=h1+24;
} 
	printf("对应的华盛顿时间为%d:%d\n",h1,m);
	
	h2=h+3;
	if(h2>=24)
	  h2=h2-24;
	  printf("对应的莫斯科时间为%d:%d\n",h2,m);
	  
	  
	  
	h3=h+7;
	if(h3>=24)
	  h3=h3-24;
	printf("对应的北京时间为%d:%d\n",h3,m);
	
	return 0;
}


*/
/*
#include<stdio.h>
int main(void)
{
	int n;
	int p;
	int l;
	int i;
	
	printf("Please enter n:");
	scanf("%d",&n);
	
	for(i=1;i<n+1;i++)
	   {p=i*i;
	    printf("%d*%d = %d\n",i,i,p);
	   
	   }
	   
	   for(i=1;i<n+1;i++)
	   {
	   	  l=i*i*i;
	   	  printf("%d*%d*%d = %d\n",i,i,i,l);
	   }
	
	
	return 0;
}

*/
/*
打印正方形 
#include<stdio.h>
int main(void)
{
	int n=5;
	int i;
	
	for(i=1;i<n+1;i++)
	   {
	   	printf("*****");
	   	printf("\n");
	   	
	   }
	
	
	
	return 0;
}

*/

/*
#include<stdio.h>
int main(void)
{
	int n;
	scanf("%d",&n);
	int i;
	int j;
	
	
	for(i=1;i<n+1;i++)
	  {
	  	for(j=1;j<=i;j++)
	  	    printf("*");
	  	
	  	printf("\n");
	  }
	return 0;
}

*/
/*
#include<stdio.h>
int main(void)
{
	
	int n;
	scanf("%d",&n);
	int i,j;
	
	for(i=1;i<n+1;i++)
	{
		for(j=n;j>=i;j--)
		   printf("*");
		
		printf("\n");
	}
	
	return 0;
}

*/
//打印空心三角形

/* 
#include<stdio.h>
int main(void)
{
	int n;
	scanf("%d",&n);
	
	int i,j;
	
	for(i=1;i<n+1;i++)
	{
		for(j=1;j<=n-i;j++)
		  printf(" ");
		for(int k=1;k<=2*i-1;k++)
		{
			if(k==1||k==2*i-1||i==n)
			printf("*");
			else
			printf(" ");
			
		}
		
		printf("\n");
		
	}
	
	
	return 0;
}



*/
/*

#include<stdio.h>
int main(void)
{
	int n;
	scanf("%d",&n);
	
	for(i=1;i<=n;i++)
	   {
	   	for (j=1)
	   }
	
	
	
	return 0;
}
*/
/*
#include<stdio.h>
int main(void)
{
	int score;
	scanf("%d",&score);
	
	
	if(score>=90)
	  printf("成绩真好，我羡慕");
	else if(score<=90&&score>=80)
	  printf("还行吧");
	else if(score<80&&score>=70)
	  printf("emmm");
    else
      printf("太差啦");
	
	return 0;
}

*/


/*
#include<stdio.h>
int main(void)
{
	int n;
	scanf("%d",&n);
	
	
	switch (n)
	{
		case1:
			printf("Monday\n");
			break;
		case 2:
		    printf("Tuesday\n");
		    break;
		case 3:
			printf("Wednesday\n");
		default:
			printf("wrong\n");
	}
	
	
	retunr 0;
}

*/

/*

#include<stdio.h>
int main(void)
{
	int year,month;
	scanf("%d %d",&year,&month);
	int day;
	
	
	switch(month)
	{
		case 1:case 3: case 5: case 7: case 8:case 10: case 12:
			day=31;
			break;
	    case 4: case 6: case 9: case 11:
	    	day=30;
	    	break;
	    case 2:
	    	if(year/100!=0&&year%4==0||year%400==0)
	    	   day=29;
	    	else
	    	   day=28;
	    break;
		default:
		 printf("wrong!");
	}
	
	printf("%d\n",day);
	
	return 0;
}


*/
/*
#include<stdio.h>
int main(void)
{
	char sex;
	int age;
	
	printf("请输入您的性别：(M/F)");
	printf("请输入您的年龄：");
	
	scanf("%c%d",&sex,&age);
	
	if(sex=='M')
	{
		if(age>=60)
		printf("男士享受年长优惠\n");
	    else
	    printf("男士正常票价\n");	
	}
	else fi(sex=='F')
	{
		if(age>=55)
		printf("女士享受年长优惠\n");
		else
		printf("女士正常票价\n");
		
	}
	else
	printf("输入错误\n");
	
	return 0;
}


*/
//数组题目

 /*
#include<stdio.h>
int main(void)
{
	int n=5;
	int a[n];
	int i;
	
	for(i=0;i<n;i++)
	scanf("%d",&a[i]);
	
	
	int max=a[0];
	int min
	=a[0];
	
	for(i=1;i<n;i++)
	   {
	   	if (max<a[i])
	   	   max=a[i];
	   	
	   	if (min>a[i])
	   	   min=a[i];
	   }
	   printf("%d %d",max,min);
	return 0;
}

*/
/*
#include<stdio.h>
int main(void)
{
	int n,a[100],sum=0;
	float pingjun;
	int i;
	printf("请输入n：");
	scanf("%d",&n);
	
	for  (i=0;i<n;i++)
	{
		scanf("%d",&a[i]);
		sum+=a[i];
		
	}
	
	pingjun =(float)(sum/n);
	printf("%f",pingjun);
	
	return 0;
}





*/
/*
//求素数：
#include<stdio.h>
#include<math.h>

int main(void)
{
	int i;
	scanf("%d",&i);
	int s=0;
	int num;
	
	if(i<=1)
	   s=0;
	else
	   {
	   	for(num=;num<=sqrt(i);num++)
	   	   {
	   	   	  if(i%num==0)
	   	   	    s++;
			  }
	   }
	if(s)
	   printf("shi");
	else
	   printf("bushi");  		
	return 0;
 } 

*/

/*
#include<stdio.h>
int main(void)
{
	int n;
	int j=1;
	int t=1;
	char ch='-';
	
	printf("Input n:\n");
	scanf("%d",&n);
	
	int i=1;
	while(i<=n)
	{
		printf("%4d",i);
		i++;
	}
	printf("\n");
	
	while(t<=n);
	{
		printf("%4d",ch);
		
	}
	
	
	
    for(j=1;j<=n;j++)
    {
    	for(t=1;t<=n;t++)
    	{
	    printf("%4d",j*t);
        }
        printf("\n");
	}
	
	
	
	return 0;
}


*/
/*
#include<stdio.h>
int main(void)
{
	int n;
	int i;
	
	printf("This program prints a table of squares.\n");
	printf("Enter number of entries in table:\n");
	scanf("%d",&n);
	
	for(i=1;i<=n;i++)
	   {
	   	printf("%10d%10d\n",i,i*i);
	   	
	   }
	
	
	return 0;
}



*/
/*
#include<stdio.h>
int main(void)
{
	int ren=30;
	int mon=50;
	int m,w,c;
	int i;
	c=0;
	printf("\tMEN\tWOMEN\tCHILDREN\n");
	printf("-----------------------------------------\n");
	
	i=1;
		for(m=0;m<=30;m++)
		   {
		   	for(w=0;w<=30;w++)
		   	    {
				   c=30-w-m;
		   	       if(3*m+2*w+c==50)
		   	        {
					   printf("%2d:\t%d\t%d\t%d\n",i,m,w,c);
		   	        i++;
		   }
		   	    }
		   	        
		   }
	
	
	return 0;
}


*/
/*

编程计算s=a+aa+aaa+aaaa+aa...a的值，其中a是一个数字。例如2+22+222+2222+22222(此时共有5个数相加)，a和相加的项数由用户输入控制。
**输入格式要求："%d,%d" 提示信息："please input a and n\n" 
**输出格式要求："a=%d,n=%d\n"  "a+aa+...=%ld\n"
程序运行示例如下：
please input a and n
3,5
a=3,n=5
a+aa+...=37035

#include<stdio.h>
int main(void)
{
	int i;
	int n;
	int a;
	long int num=0;
	long int sum=0;
	
	printf("please input a and n\n");
	scanf("%d,%d",&a,&n);
	printf("a=%d,n=%d\n",a,n);

	for(i=1;i<=n;i++)
	{
		num=num*10+a;
		sum+=num;
	}
	printf("a+aa+...=%ld\n",sum);
	return 0;
}
//

i num
1  22
2   222
3   2222
4   22 



*/

/*
#include<stdio.h>
int main(void)
{
	int num;
	int i;
	
	for(i=1;i<=9;i++)
	   {
	   	num=num*(1/2)-1;
	   }
	num=1;
	
	return 0;
}

*/
/*
猴子吃桃问题。猴子第一天摘下若干个桃子，当即吃了一半，还不过瘾，又多吃了一个。第二天早上又将剩下的桃子吃掉一半，又多吃了一个。以后每天早上都吃了前一天剩下的一半零一个。到第10天早上再想吃时，见只剩一个桃子。求第一天共摘了多少桃子。
**输出格式要求："桃子总数=%d\n"
程序运行示例如下：
桃子总数=xxxx

*/
/*
#include<stdio.h>
int main(void)
{
	int num=1;
	int i;
	
	for(i=1;i<=9;i++)
	{
	    num=(num+1)*2;
		
	}
	
	printf("桃子总数=%d\n",num);
	return 0;
}
*/


/*
#include<stdio.h>
int main(void)
{
	int i;
	int n;
	char ch='-';
	int j;
	
	
	printf("Input n:\n");
	scanf("%d",&n);
	
	for(i=1;i<=n;i++)
	{
		printf("%4d",i);
		
	}
	printf("\n");
	
	
	for(i=1;i<=n;i++)
	   printf("%4c",ch);
	   printf("\n");
	   
	 for(i=1;i<=n;i++)
	 {
	 	for(j=1;j<=i;j++)
	    	printf("%4d",i*j);
	 	printf("\n");
	  } 
	return 0;
}


*/ 

/*
#include<stdio.h>
  int main(void)
  {
    char ch; 
    ch=getchar();
    putchar(ch);
    
 
  	
  	return 0;
  }



for(i=0;i<n;i++)
{
	a[i]>a[i+1];
	t=a[i];
	a[i]=a[i+1];
	a[i+1]=t;
	
	
}

*/

//学习函数
/*
#include<stdio.h>
void f(void)
{
	int i;
	for(i=1;i<5;i++)
	   {
	   	printf("i want to wake up!\n");
	   	break ;//break只会终止它所在的这个for 循环 
	   }
	printf("I believe i am living a better life.");
}
int main(void)
{
	f();
	return 0;
 } 
 
 
 */
/*
#include<stdio.h> 
void f(void)
{
	int i;
	for(i=1;i<5;i++)
	   {
	   	printf("i want to wake up!\n");
	   	return ;//return 会终止它所在的这个函数 
	   }
	printf("I believe i am living a better life.");
}
int main(void)
{
	f();
	return 0;
 } 

/*
------
输出： 
return——
 
i want to wake up!


return 0——（×）
 
*/


/*
#include<stdio.h> 
int  f(void)
{
	int i;
	for(i=1;i<5;i++)
	   {
	   	printf("i want to wake up!\n");
	   	return 3;//return 会终止它所在的这个函数 
	   }
	printf("I believe i am living a better life.");
}
int main(void)
{
	f();//return 只是告诉这个程序f的结果是3，但没有printf，所以不会显示。“没有告知的义务？ ” 
	return 0;
 } 


*/
//函数举例子 求最大值 
//实现功能需要maiin和函数的协调配合 
/*
1.
#include<stdio.h>
void max(int i,int j)
{
	if(i>j)
	  printf("%d\n",i);
	else
	  printf("%d\n",j);
}
int main(void)
{
	int a,b,c,d;
	a=2;
	b=3;
	c=4;
	max(a,b);
	max(b,c);
	max(a,c);
	
	return 0;
 } 


*/
/*
2.
#include<stdio.h>
int max(int i,int j)
{
	if(i>j)
	  return i; 
	else
	  return j;
}
int main(void)
{
	int a,b,c,d;
	a=2;
	b=3;
	c=4;
	max(a,b);
	printf("%d\n",max(a,b));
	max(b,c);
	max(a,c);
	
	return 0;
 } 
*/

//一，改变函数返回值，从void变为int
//二，return X 代表了返回 X，
//三，返回了不代表要打印出来，需要有一个printf才能打印。
//注意printf里输出参数写的是什么，不是i和j，而是a，和b
 //想要输出：1.函数里直接输出
 //          2.把值返回过来，在main里输出 


//函数举例子  判断数字 是不是素数
//我自己的代码（gpt修改版） 
/*
#include<stdio.h>
int  sushu(int i)//发现要返回sum，所以把void改为了int 
{
	int j;
	int sum=0;
	if(i==1||i==2)
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
//老师的代码
/*
一，什么是素数？只能被1和它本身整除 
二,从1到该数字，只要用这个数字除以中间的数字就行了，（除去它自己和1） ，如果有一个，就不是素数 
*/ 
/*
#include<stdio.h>
int main(void)
{
	int val;
	int i;
	
	scanf("%d",&val);
	for(i=2;i<val;++i)
	{
		if(val%i==0)
		break;//break如果能执行（终止for循环，则i一定是小于val的 
		//如果i的值一直加到了val，说明这个语句没有成立过   
	}
	
	if (i==val) 
	    printf("Yes!\n");
	else
	    printf("No!\n");
	
	return 0;
	
}
*/
//这个程序只能求一个数据是不是素数。
//下面使用函数 
 
/*
#include<stdio.h>

 IsPrime()  //先写出了函数名字IsPrime ，然后想是否有返回值，返回值类型是什么 
{
 	
 }
 
 
int main(void)
{
	
	
	return 0;
}



*/
/*
#include<stdio.h>

bool IsPrime()  //c中有一个数据类型是bool类型（布尔类型）， 这个bool类型只有两个值，一个真值一个假值 
{//当然这里也可以用整型，1为真0为假 ，bool更好一些 
 	
 }
 
 
int main(void)
{
	
	
	return 0;
}

*/

//是否需要定义形参？
//是为了一个具体的程序设计的？ 
//还是大量的 类似问题设计？
//是否需要接受数据？不接收数据怎么知道对谁判断？
// 功能：判断一个数字是不是素数，所以要定义一个形参，来接收待判断的数字
//一个够吗？ 
//  如果求两个数字的最大值，写两 个形参。如果求四个数字的最大值，写四个形参。
//几个形参看具体功能。 
/*
#include<stdio.h>

bool IsPrime(int val)  
{
	int i;
	
	for(i=2;i<val;i++)
	{
		if(val%i==0)
		  break;
	}

}

int main(void)
{
	
	
	return 0;
}

//打印功能，函数功能，程序内不同块的功能划分 

// Isprime这个函数的功能是对这个数字是不是素数进行判断真假，不要它对真假这个结果进行处理。
//所以不能写printf 

#include<stdio.h>

bool IsPrime(int val)  
{
	int i;
	
	for(i=2;i<val;i++)
	{
		if(val%i==0)
		  break;
	}
	if (i==val)
	   printf("Yes!\n");//不能这么写，看下面 
	else
	   printf("No!\n");//no！ 
	   

}

int main(void)
{
	
	
	return 0;
}

*/
//不要把整个功能粘合在一起。写函数，尽量功能单一 
//是不是素数的结果如何处理交给程序的另一个部分 
/*
#include<stdio.h>

bool IsPrime(int val)  //上下两个val是没有冲突的，因为这个val是只在上面使用后，下面那个只能在main使用 
{
	int i;
	
	for(i=2;i<val;i++)
	{
		if(val%i==0)
		  break;
	}
	if (i==val)
	   return  true;
	else
	   return false;
	   

}

int main(void)
{
	int val;
	int i;
	
	scanf("%d",&val);
	
	if(IsPrime(val))
	 printf("Yes!");
	else
	   printf("No!");
	
	return 0;
}

*/
/*
#include<stdio.h>

bool IsPrime(int val)  //上下两个val是没有冲突的，因为这个val是只在上面使用后，下面那个只能在main使用 
{
	int i;
	
	for(i=2;i<val;i++)
	{
		if(val%i==0)
		  break;
	}
	if (i==val)
	   return  true;
	else
	   return false;
	   
	//…… 如果这里还有其他语句，是不会执行的。因为上面return执行之后，这 

}

int main(void)
{
	int m;
	int i;
	
	scanf("%d",&m);
	
	if( IsPrime(m) )//调用IsPrime函数，m的值发送给val 
	//  上面这  IsPrime(m) 的值最终是true或者false 
	   printf("Yes!");
	else
	   printf("No!");

	return 0;
}


*/

//易错大总结！！！！！！！！！！！！！
/* 
#include<stdio.h>

void f(void)
{
	
	
}
int main(void)
{
	
	f(5);//这样是错的，因为f（void），括号里是void所以无形参 ，没法发送过去 
	return 0;
}



#include<stdio.h>

void f(int i)
{
	
	
}
int main(void)
{
	
	f(5);//这样是对的 
	return 0;
}





#include<stdio.h>

void f(int i,int j)
{
	
	
}
int main(void)
{
	
	f(5);//这样错了 
	return 0;
}





#include<stdio.h>

void f(int i)
{
	
	
}
int main(void)
{
	int i;
	
    i=f(5);//这样错了 ,因为   f（）前面的void表示函数没有返回值 ，现在要把f（5） 执行的结果赋给i，但没有返回值 
	return 0;
}




#include<stdio.h>

int f(int i)
{
	
	
}
int main(void)
{
	int i;
	
    i=f(5);//这样错了 , f（）前面的int 是有返回值的一种表现，这个是对的，但是内部没写return ，没有返回值 
	return 0;
}




#include<stdio.h>

int f(int i)
{
	
	return 10;//return 的含义：1.终止f函数  2.向调用f函数的地方返回return 后面写的值，此处为10 
}
int main(void)
{
	int i;
	
    i=f(5);
	return 0;
}


#include<stdio.h>

int f(int i)
{
	
	return 10;//
}
int main(void)
{
	int i=99;
	printf("%d\n",i);
    i=f(5);
    printf("%d\n",i);
    
	return 0;
}
--
输出：
99
10
 

#include<stdio.h>

int f(int i)
{
	
	return 10.8;
}
int main(void)
{
	int i=99;
	printf("%d\n",i);
    i=f(5);
    printf("%d\n",i);
    
	return 0;
}

输出：99
10
 


#include<stdio.h>

int f(int i)
{
	
	return 10.8;
}
int main(void)
{
	float i=99;
	printf("%f\n",i);
    i=f(5);
    printf("%f\n",i);
    
	return 0;
}
*/



//函数的声明
/*
1.没形参一定要写void
 
#include<stdio.h>

void f()//这个函数是不规范的，没有形参要写void，即使写不写效果一样， 
{
	
	printf("HH!");
}
int main(void)
{

	return 0;
}

改正：

  
#include<stdio.h>

void f(void)//这个函数是不规范的，没有形参要写void，即使写不写效果一样， 
{
	
	printf("HH!");
}
int main(void)
{
    f();
	return 0;
}

//2.函数的声明 

#include<stdio.h>
int main(void)
{
	f();
    
	return 0;
}

void f(void)
{
	printf("haha!");
}


//放下面，报错

//因为先从main进去，不知道f（）是个函数名。
//放上面，（因为是从上往下编译的），就知道是个函数名了

 //如果想把函数放在main函数下面且不出错，就加一个函数的声明 
 //函数的声明分号一定不能丢！！！！ 

//函数的声明 告诉程序，将来会有一个叫f的东西，它没有形参，没有返回值 

#include<stdio.h>
void f(void);//分号别丢了！！ 
int main(void)
{
	f();
    
	return 0;
}

void f(void)
{
	printf("haha!");
}


//如果： 


#include<stdio.h>
void f(int);//分号别丢了！！ 
int main(void)
{
	f();//会报错  ，因为前面已经生命力f内部的形参是整型的，所以进行到这里就报错了 
    
	return 0;
}

void f(void)
{
	printf("haha!");
}


//函数嵌套＋调用
#include<stdio.h>
void g(void)
{
	
	f();//此处调用了f，但f没有定义，所以会报错 
	//函数f的定义放到了调用f的语句的后面，所以语法出错 
}
void f(void)
{
	printf("ha!\n");
}
int main(void) 
{
	g();
	
}
//形参和实参
1.
#include<stdio.h>
void f(int i)//这里是形参 
{
	printf("%d\n",i);
	
}
int main(void)
{
	f(5)//5是实参 
	return 0;
 } 
 
 
 
2.

#include<stdio.h>
void f(int i,int j)//这样会报错 
{
	printf("%d\n",i);
	
}
int main(void)
{
	f(5)//数量不匹配，报错 
	return 0;
 } 
//必须一一对应 

3.
//类型要对应 
#include<stdio.h>
void f(int i,float x)
{
	printf("%d\n",i);
}

int main(void)
{
	f(5,6.6);
	
	return 0;
}

//或者说类型能够兼容
//下面这个可以兼容 
 #include<stdio.h>
void f(int i,float x)
{
	printf("%d\n",i);
}

int main(void)
{
	f(5。8,6.6);
	
	return 0;
}

//下面这个就不能兼容
 
#include<stdio.h>
void f(int i,float x)
{
	printf("%d\n",i);
}

int main(void)
{
	f("caleb",6.6);
	
	return 0;
}








*/








//如何在开发中合理地设计函数来解决实际问题 

/*
判断一个数字是否是素数 
只用一个函数实现，不好，代码的利用率不高 
*/
/*
#include<stdio.h>
int main(void)
{
	int i;
	int val;
	
	scanf("%d",&val);
	
	for(i=2;i<val;++i)
	{
		if(val%i==0)
		  break;
		
	}
	if(i==val)
	  printf("Yes!\n");
	else
	  printf("No!\n");
	  
	  
	  
	return 0;
}

//函数设计功能要单一（判断；处理……） 

//接下来设计函数
//判断一个数字是否是素数，用单独的代码来实现，可利用性提高 
#include<stdio.h>
bool IsPrime(int val)
{
	int i;
	
	for(i=2;i<val;i++)
	{
		if(val%i==0)
		break;
		
	}
	
	if(i==val)
	return true;
	else
	return false;
	
}
int main(void)
{
	int val;
	scanf("%d\n",&val);
	IsPrime(val);
	
	if ( IsPrime(val) )
	   printf("Yes!\n");
	else 
	   printf("No~");
	
	return 0;
 } 


*/

/*
//求1到某个数字之间所有的素数，并且输出 


#include<stdio.h>
bool IsPrime(int val)
{
	int i;
	
	for(i=2;i<val;i++)
	{
		if(val%i==0)
		break;
		
	}

	
	if(i==val)
	return true;
	else
	return false;
	
}

int main(void)
{
	int num;
	int val;
	int i;
	
	scanf("%d",&num);
	for(i=1;i<=num;i++)
	{
		val=i;
		IsPrime(val);
		
		if(IsPrime(val) )
		  printf("%d is Prime!\n",i);
		else
		  printf("%d is not Prime!\n",i);
	}
	
	
	return 0;
}

//以上为我写的代码。为什么无法判断1呢？ 

//逻辑出错了
首先，1不是素数（质数）
素数/质数指：大于1的自然数，除了1和它本身外，没有其他正因数（无法被其他自然数整除）
 
 
//老师的代码 
#include<stdio.h>
int main(void)
{
	int val;
	int i;
	int j;
	
	scanf("%d",&val);
	for(i=2;i<val;i++)
	{
		for(j=2;j<i;j++)
		{
			//这个for循环内部要判断是不是素数，是就输出，不是就不输出 
			if(i%j==0)//定义另一个变量j，i除以j的值（从2到i-1）能整除就不是素数
			{
				printf("Yes!");
				break;
			}
			if(i==j)
			printf("%d",i);
		
		}
	 } 
	
	return 0;
 } 

/*
1.代码的重用性不高， 
2.代码不容易理解


 

 //使用函数 
#include<stdio.h>
bool IsPrime(int i)
{
	int j;
	for(j=2;j<i;j++)
	{
		if(i%j==0)
		break;
	}
	if(i==j)
	return true;
	else
	return false;
	
}

int main(void)
{
	int val;
	int i;

	scanf("%d",&val);
	for(i=2;i<=val;i++)
	{
		if(IsPrime(i))
		  printf("%d\n",i);
		
	}
	return 0;
}
//代码更容易理解了，可重用性高了一些 
//这个程序的缺陷：
// 可重用性依然不是很高，蔽日求100000个数字，从一到它们本身的所有素数，要输入100000次 

*/





/*

//再次进行修正
//用两个函数实现求1到某个数字之间所有的素数，并将其输出，代码量更少，可重复性更高 
#include<stdio.h>

//本函数的功能是：判断 m是否是素数，是：返回true；不是：返回false 
bool IsPrime(int m)
{
	int j;
	for(j=2;j<m;j++)
	{
		if(m%j==0)
		break;
	}
	if(i==m)
	  return true;
	else
	  return false;
	
}

//这个函数的功能是把1到n之间所有素数在显示器上输出 
void TraverseVal(int n)
{
	int i;
	
	for(i=2;i<=n;++i)
	{
		if(IsPrime(i))
		  printf("%d\n",i);
		
	}
	
}

int main(void)
{
	int val;
	int i;

	scanf("%d",&val);
    TraverseVal(val);

	return 0;
}
  
*/

/*求最大素数
求500以内的10个最大素数及其和，并分别输出这10个最大素数及其和。
要求10个素数按从大到小的顺序输出。

输入格式: 无
输出格式：
10个最大素数的输出格式："%6d"
总和的输出格式："\nsum=%d\n"

#include<stdio.h>
int f(int i)
{
	int a[9];
	int j;
	int sum;
	int t;
		for(i=500;i>0;i--)
	{
		for(j=2;j<i;j++)
		{
			if(i%j==0)
			  break;
			else
			  {
			  	for(t=0;t<10;t++)
			  	   {
			  	   	a[t]=i;
			  	   	sum+=a[t];
					 }
			  	
			  	
			  }
		}
		
	}
	
	return sum,a[9];
	
}

int main(void)
{
	int a[10];
	int num=500;
	int i;
	int j=0;
	int sum;
	f(i);
	
	printf("\nsum=%d\n",sum);
	
	for(j=0;j<10;j++)
	{
		printf("%6d",a[j]);
		
		
	}

	
	
	return 0;
}





#include <stdio.h>
#include <math.h>

// 判断素数
int isPrime(int n) 
{
    if (n < 2) 
    	return 0;
    	
    for (int i = 2; i <= sqrt(n); i++) 
	{
        if (n % i == 0) return 0;
    }
    return 1;
}

int main() {
    int primes[10];
    int count = 0;
    int sum = 0;

    // 从500往下找素数
    for (int i = 500; i >= 2 && count < 10; i--) {
        if (isPrime(i)) {
            primes[count] = i;
            count++;
        }
    }

    // 输出 10 个最大素数
    for (int i = 0; i < 10; i++) {
        printf("%6d", primes[i]);
        sum += primes[i];
    }

    // 输出总和
    printf("\nsum=%d\n", sum);

    return 0;
}


//初始化部分： 
//首先，我需要一个数组来存储各个素数 
//其次，我需要一个sum来进行求和统计
//再次，我需要一个变量来记录，算到第几个素数了，到十就停止

//函数部分：
//1.判断素数
//2.存储部分
//3.记数部分


//以下为我自己的2.0版本

#include<stdio.h>
bool IsPrime(int t)
{
	int i;
	int j=0;
	for(i=2;i<t;i++)
	{
		if(t%i==0)//怎么又在if后面＋分号！！ 
		   j++;
	}
	if(j!=0)
	  return false;
	else
	 return true;
	
}
int main(void)
{
 	int t=500;
 	int i;
 	int a[10];
 	int count=0;
 	int j;
 	int sum=0;
 	
 	for(t=500;t>2;t--)
 	{
 		IsPrime(t);
 		
 		if(IsPrime(t))
 		   {
 	    for(count;count<11;count++)
 	    {
 	    
 				
			 sum+=t;	
			 
		 }
		 printf("%6d",t);
		 
		 
 	
 	    	}
	 }
 	printf("\nsum=%d\n",sum);
 	
 	return 0;
 }




#include<stdio.h>
#include<stdbool.h>

bool IsPrime(int t)
{
	int i;
	int j=0;
	for(i=2;i<t;i++)
	{
		if(t%i==0)//怎么又在if后面＋分号！！ 
		   j++;
	}
	if(j!=0)
	  return false;
	else
	 return true;
	
}
int main(void)
{
 	int t=500;
 	int i;
 	int a[10];
 	int count=0;
 	int j;
 	int sum=0;
 	
 	for(t=500;t>2;t--)
 	{
 		IsPrime(t);
 		
 		if(IsPrime(t))
 		   {
 	        a[count]=t;
 	        count++;
 	   	
			 if(count==10)
			 break;
		 
 	
 	    	}
	 }
	 
	 for(i=0;i<10;i++)
	 {
	 	
	 	printf("%6d",a[i]);
	 	sum+=a[i];
	 }
 	printf("\nsum=%d\n",sum);
 	
 	return 0;
 }


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
int fun(int m)
{
	int i;
	int j=0;//必须初始化 
	for(i=2;i<m;i++)
	 {
	  if(m%i==0)
	  j++;
     }  
     
     if(j!=0)
     return 0;
     else
     return 1;
}

int main(void)
{
	int m;
	int sum=0;
	
	for(m=100;m<201;m++)
	{

		if(fun(m))
		{
			sum+=m;
		}
	

     }
     
     	printf("sum=%d\n",sum);
	return 0;

}


*/
/*
写一个函数测试某个整数值是否落在某个范围之内。函数原型如下：
	  int range_test( int val, int low, int high ) ;
其中val是要测试的值，low是范围的最小值，high是范围的最大值。如果落在指定的范围内，函数返回1，否则返回0。编写main函数调用它并进行测试。

**输入格式要求："%d%d%d" 提示信息："请输入数值、下界和上界：\n"
**输出格式要求："函数测试输出为%d！\n" （输出为：1或者0）

*/

/*
#include<stdio.h>
int range_test( int val, int low, int high ) 
{
	if(val>=low&&val<=high)
	return 1;
	else
	return 0;

}

int main(void)
{
	int val;
	int low;
	int high;
	
	printf("请输入数值、下界和上界：\n");
	scanf("%d%d%d",&val,&low,&high);


	printf("函数测试输出为%d！\n",range_test(val, low, high ) );//此出只写变量名，不能写类型 

	return 0;
}

*/



/*
#include<stdio.h>
double cylinder(double r, double h)
{
	double volume;
	
	volume=3.1415926*r*r*h;
	
	return volume;
	
}

int main(void)
{
	double r;
	double h;
	
	
	printf("Enter radius and height: ",r,h);
	scanf("%lf%lf",&r,&h);
	
	printf("Volume = %.3f\n",cylinder(r, h));
	
	
	
	return 0;
}

*/
/*
寻找中位数v1.0
编写一个函数返回三个整数中的中间数。
函数原型：int mid(int a, int b, int c); 
功能是返回a，b，c三数中大小位于中间的一个数。

程序运行结果示例1：
12 6 18↙
The result is 12

程序运行结果示例2：
-9 7 -2↙
The result is -2

输入格式: "%d%d%d"
输出格式："The result is %d\n"



#include<stdio.h>
int mid(int a, int b, int c)
{
	int t;
	
	if((a>=b&&a<=c)||(a>=c&&a<=b))
        t=a;
		
		
	if((b>=a&&b<=c)||(b>=c&&b<=a))
	   t=b;
	   
	if((c>=a&&c<=b)||(c>=b&&c<=a))
	  t=c;	
	
	return t;
	
}


int main(void)
{
	int a,b,c;
	scanf("%d%d%d",&a,&b,&c);
	
	mid(a,b,c);
	
	printf("The result is %d\n",mid(a,b,c));
	
	
	return 0;
}

//爱来自g老师 

#include<stdio.h>
int mid(int a, int b, int c)
{
    int t;

    // 让 a 是最小的
    if (a > b) { t = a; a = b; b = t; }
    if (a > c) { t = a; a = c; c = t; }

    // 现在 a 是最小的，再让 b 是中间的
    if (b > c) { t = b; b = c; c = t; }

    return b;  // b 就是中间数
}

int main(void)
{
	
	int a,b,c;
	scanf("%d%d%d",&a,&b,&c);
	
	
	printf("The result is %d\n",mid(a,b,c));
	
	
	
	return 0;
}



*/
/*
#include<stdio.h>
int t(int h,int m,int s)
{
	int time=0;
	
	time=h*60*60+m*60+s;
	
	return time;
}
int main(void)
{
	int h,m,s;
	
	printf("请输入时间（时分秒三个整数）：\n",h,m,s);
	scanf("%d%d%d",&h,&m,&s);
	
	printf("%d小时%d分钟%d秒合计%d秒！\n",h,m,s,t(h,m,s));
	
	
	
	return 0;
}

*/
/*
亲密数_1
2500年前数学大师毕达哥拉斯就发现，220与284两数之间存在着奇妙的联系：
220的真因数之和为：1+2+4+5+10+11+20+22+44+55+110=284
284的真因数之和为：1+2+4+71+142=220
毕达哥拉斯把这样的数对称为相亲数。相亲数，也称为亲密数，如果整数A的全部因子（包括1，不包括A本身）之和等于B，且整数B的全部因子（包括1，不包括B本身）之和等于A，则将整数A和B称为亲密数。
从键盘任意输入两个整数m和n，编程判断m和n是否是亲密数。若是亲密数，则输出“Yes!”，否则输出“No!”

程序运行示例1
Input m, n:
220,284↙
Yes!

程序运行示例2Input m, n:
224,280↙
No!

输入格式: "%d,%d"
输出格式：
输入提示信息："Input m, n:\n"
输出提示信息："Yes!\n"
              "No!\n"
              
#include<stdio.h>
int h(int m,int n)
{
	int i;
	int sum1=0;
	int sum2=0;
	
	for(i=1;i<m;i++)
	{
		if(m%i==0)
		sum1+=i;

	}
	
	for(i=1;i<n;i++)
	{
		if(n%i==0)
		sum2+=i;
	}
	if(sum1==n&&sum2==m)
	return 1;
	else
	return 0;
}
int main(void)
{
	int m,n;
	
	printf("Input m, n:\n");
	scanf("%d,%d",&m,&n);
	
	if(h(m,n))
	printf("Yes!\n");
	else
	printf("No!\n");
	
	return 0;
}

*/
/*
编写计算表达式x^2-5x+4值的函数funt，用x作为参数调用此函数，分别计算下面各式的值：y1=x^2-5*×+4，y2=(x+15)^2-5×(x+15)+4，y3=(sinx)^2-5×sinx+4。
**输入格式要求："%lf" 提示信息："Input x: "
**输出格式要求："x =\t%5.2f\n"  "y1=\t%5.2f\n" "y2=\t%5.2f\n" "y3=\t%5.2f\n"
程序运行示例如下：
Input x: 3.5
x =	 3.50
y1=	-1.25
y2=	253.75
y3=	 5.88

*/


/*
#include<stdio.h>
#include<math.h>
double funt(double x)
{
	double y1,y2,y3;
	
	y1=x*x-5*x+4;
	y2=(x+15)*(x+15)-5*(x+15)+4;
	y3=(sinx)*(sinx)-5*(sinx)+4;
	
	return y1,y2,y3;
}
int main(void)
{
	double x;
	
	printf("Input x: ");
	scanf("%lf",&x);
	
	
	printf("x =\t%5.2f\n",x);
	printf("y1=\t%5.2f\n",y1);
	printf("y2=\t%5.2f\n",y2);
	printf("y3=\t%5.2f\n",y3);
	
	
	return 0;
}

//g老师：
 

#include<stdio.h>
#include<math.h>
double funt(double x)
{
	return x*x-5*x+4;
	
}
int main(void)
{
	double x;
	
	
	printf("Input x: ");
	scanf("%lf",&x);
	
	printf("x =\t%5.2f\n",x);
	printf("y1=\t%5.2f\n",funt(x));
	printf("y2=\t%5.2f\n",funt(x+15));
	printf("y3=\t%5.2f\n",funt(sin(x)));
	
	
	
	return 0;
}

*/

/*
输出指定行列数的字符
编写一个函数，函数原型：void Chline(char ch, int column, int row);
该函数的3个参数是一个字符和两个整数。字符参数是需要输出的字符。第一个整数说明了在每行中该字符输出的个数，而第二个整数指的是需要输出的行数。编写一个调用该函数的程序。

程序运行结果示例1：
input a char:
k↙
input column and row:
2 3↙
kk
kk
kk

程序运行结果示例2：
input a char:
a↙
input column and row:
3 2↙
aaa
aaa

输入格式:
"%c"
"%d%d"
输出格式：
字符输入提示信息："input a char:\n"
行列数输入提示信息："input column and row:\n"
输出格式："%c"

#include<stdio.h>
void Chline(char ch, int column, int row)
{
	int i;
	int j;
	for(i=1;i<row+1;i++)
	{
		for(j=1;j<column+1;j++)
		{
			printf("%c",ch);
			
		}
	    printf("\n");
		
	}
	
	
}


int main(void)
{
	char ch;
	int column;
	int row;
	
	
	printf("input a char:\n");
	scanf("%c",&ch);
	
	printf("input column and row:\n");
	scanf("%d%d",&column,&row);
	
    Chline(ch,column,row);
    
    
	return 0;
}

*/

/*
回文素数
所谓回文素数是指对一个素数n，从左到右和从右到左读是相同的，这样的数就称为回文素数，例如11，101，313等。编程计算并输出不超过n（100<=n<1000）的回文素数，并统计这些回文素数的个数，其中n的值从键盘输入。

程序运行示例1
Input n:
100↙
  11
count=1

程序运行示例2
Input n:
1000↙
  11 101 131 151 181 191 313 353 373 383 727 757 787 797 919 929
count=16

输入格式:"%d"
输出格式：
输入提示信息："Input n:\n"
输出格式："%4d"
          "\ncount=%d\n"
*/

/*
#include<stdio.h>
int h(int n)
{
	int t;
	int i;
	int h;
	int num=0;
	
    if(n>=100&&n<1000)
    {
    	if(n<=99)
		{
			for(i=10;i<=n;i++)
			{
				h=(i%10)*10+i/10;
				if(h==i)
				{
					printf("%4d",h);
					num=num+1;
				}
				
				
			}
			
		}
    	
    	else if(n>=100&&n<1000)
    	{
    			for(i=10;i<=n;i++)
			{
				h=(i%10)*100+(i/10)*10+i/100;
				if(h==i)
				{
					printf("%4d",h);
					num=num+1;
				}
				
	     	}
    
				
			}
    	
	}
	
	return num;
}
int main(void)
{
	int n;
	
	
	printf("Input n:\n");
	scanf("%d",&n);
	h(n);
	
	
	printf("\ncount=%d\n",h(n));
	
	
	
	return 0;
}



下面我继续用 初中生能听懂的方式 向你解释：
你的这段代码，几乎每一部分都写错方向了，我会先告诉你哪些地方错了，再给你正确且易懂的代码。


---

?? 一、你的主要错误（逐条解释）

? 1. scanf 写错了

你写的是：

scanf("%d", n);

正确写法必须加 &：

scanf("%d", &n);


---

? 2. 你的回文判断公式全部写错了

你写的：

h=(i%10)*100+(i/10)*10+i/100;

这是非常混乱的，你的公式：

对于 121 会变成错误结果

对于 101、131、191 都会算错



---

? 3. 你没有判断素数（题目要求“回文素数”）

你只判断了“回文”，
但是题目要的是：

> 既是回文，又是素数



例如：
121 是回文，但不是素数，不能输出。


---

? 4. 你的 h() 函数逻辑太混乱，条件重复，变量名重复，返回值错误


---

? 5. main 中调用两次 h(n)，导致结果重复计算


---

?? 二、正确思路（非常简单）

1. 写一个判断素数的函数


2. 写一个判断回文的函数


3. 主函数里遍历：

i = 11 → n
如果既是素数又是回文 → 输出、计数




---

?? 三、最终正确代码（你能完全看懂）

#include <stdio.h>

// 判断是否是素数
int isPrime(int x)
{
    int i;
    if (x < 2) return 0;
    for (i = 2; i * i <= x; i++)
        if (x % i == 0)
            return 0;
    return 1;
}

// 判断是否是回文
int isPalindrome(int x)
{
    int t = x, r = 0;

    while (t > 0)
    {
        r = r * 10 + t % 10; // 反转数
        t = t / 10;
    }

    return r == x;
}

int main(void)
{
    int n, i, count = 0;

    printf("Input n:\n");
    scanf("%d", &n);

    for (i = 11; i <= n; i++)
    {
        if (isPrime(i) && isPalindrome(i))
        {
            printf("%4d", i);
            count++;
        }
    }

    printf("\ncount=%d\n", count);

    return 0;
}


---

?? 四、为什么这段代码是正确的？（超级简单解释）

? 判断素数

试除法：
从 2 到 √n 遍历，看是否能整除。

? 判断回文

把数字反转，比如：

313
→ 3 → 31 → 313

最后比较：

反转后的 == 原来的？

? 主程序

循环从 11 到 n，看：

是不是素数？
是不是回文？

都满足 → 输出 → count++


---

?? 五、你可以自己测试的输入示例

输入	输出

100	11<br>count=1
1000	11 101 131 151 … 929<br>count=16


完全和题目示例一致。


---

如果你愿意，我还能帮你做：

? 把回文判断画成图示
? 带你手把手模拟 131 是怎么被判断为回文的
? 教你写一个更快的版本（竞赛写法）

要继续吗？


#include<stdio.h>
int hui(int i)
{
	int t;
	int h;
	h=i;
    while(h>0)
    {
    	t=(h%10)*10+h/10;
    	h=h/10;
	}
	if(t==i)
	  return 1;
	else
	  return 0;
}
int su(int i)
{
	int j;
	for(j=2;j<i;j++)
	{
		if(i%j==0)
		return 1;
		
	}
	
	return 0;
	
}
int main(void)
{
	int n;
	int i;
	int count=0;
	
	printf("Input n:\n");
	scanf("%d",&n);
	
	for(i=10;i<=n;i++)
	{
		if(hui(i)&&su(i))
		printf("%4d",i);
		count++;
	}
	
	return 0;
	
}

*/



#


























































